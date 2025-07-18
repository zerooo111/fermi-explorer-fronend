package websocket

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/continuum/backend/internal/grpc"
	"github.com/gorilla/websocket"
	pb "github.com/continuum/backend/proto"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		if origin == "" {
			// No origin header (e.g., direct connection) - allow for now
			// In stricter security, you might want to deny this
			return true
		}

		// Get allowed origins from environment
		allowedOriginsEnv := os.Getenv("CORS_ALLOWED_ORIGINS")
		if allowedOriginsEnv == "" {
			// Default development origins
			allowedOrigins := []string{
				"http://localhost:3000",
				"http://localhost:5173",
				"http://localhost:3001",
			}
			for _, allowed := range allowedOrigins {
				if origin == allowed {
					return true
				}
			}
			log.Printf("⚠️  WebSocket origin '%s' not in default allowed origins", origin)
			return false
		}

		// Check against configured origins
		allowedOrigins := strings.Split(allowedOriginsEnv, ",")
		for _, allowed := range allowedOrigins {
			allowed = strings.TrimSpace(allowed)
			if origin == allowed {
				return true
			}
		}

		log.Printf("⚠️  WebSocket origin '%s' not allowed. Allowed origins: %s", origin, allowedOriginsEnv)
		return false
	},
}

// Configuration constants
const (
	// Worker pool configuration
	DefaultMaxWorkers       = 100
	DefaultWorkQueueSize    = 1000
	DefaultMaxClients       = 1000
	
	// Connection timeouts
	DefaultWriteTimeout     = 10 * time.Second
	DefaultReadTimeout      = 60 * time.Second
	DefaultPingInterval     = 30 * time.Second
	DefaultPongTimeout      = 10 * time.Second
	
	// Cleanup intervals
	DefaultCleanupInterval  = 5 * time.Minute
	
	// Throttling configuration for WebSocket updates
	DefaultThrottleFPS      = 24                    // 24 FPS for smooth UI updates with excellent performance
	DefaultThrottleInterval = 42 * time.Millisecond // 1000ms / 24fps = ~41.67ms
)

// Client represents a WebSocket client connection with metadata
type Client struct {
	conn        *websocket.Conn
	id          string
	lastPing    time.Time
	ctx         context.Context
	cancel      context.CancelFunc
	sendChan    chan []byte
	isActive    atomic.Bool
	
	// Throttling fields for rate-limited updates
	throttleTicker *time.Ticker
	latestTick     *pb.Tick
	tickMutex      sync.RWMutex
	needsUpdate    atomic.Bool
	
	// Write synchronization to prevent concurrent writes
	writeMutex sync.Mutex
}

// BroadcastJob represents a job to broadcast data to a client
type BroadcastJob struct {
	client *Client
	data   []byte
}

// WorkerPool manages a pool of workers for handling WebSocket operations
type WorkerPool struct {
	maxWorkers   int
	jobQueue     chan BroadcastJob
	workerQueue  chan chan BroadcastJob
	workers      []Worker
	wg           sync.WaitGroup
	ctx          context.Context
	cancel       context.CancelFunc
	activeJobs   atomic.Int64
}

// Worker represents a worker in the pool
type Worker struct {
	id          int
	workerPool  chan chan BroadcastJob
	jobChannel  chan BroadcastJob
	quit        chan bool
}

// TickMetrics holds tick rate calculation data
type TickMetrics struct {
	tickCount      atomic.Int64
	lastResetTime  atomic.Int64 // Unix timestamp in nanoseconds
	ticksPerSecond atomic.Int64 // Calculated ticks per second
	mutex          sync.RWMutex
}

// Metrics holds connection and performance metrics
type Metrics struct {
	ActiveConnections   atomic.Int64
	TotalConnections    atomic.Int64
	ActiveWorkers       atomic.Int64
	QueuedJobs          atomic.Int64
	DroppedConnections  atomic.Int64
	BroadcastErrors     atomic.Int64
}

type StreamHandler struct {
	grpcClient     *grpc.Client
	clients        map[string]*Client
	clientsMux     sync.RWMutex
	workerPool     *WorkerPool
	metrics        *Metrics
	tickMetrics    *TickMetrics
	ctx            context.Context
	cancel         context.CancelFunc
	cleanupTicker  *time.Ticker
	maxClients     int
	lastTickNumber atomic.Uint64 // Track last processed tick to avoid double counting
}

// NewTickMetrics creates a new tick metrics tracker
func NewTickMetrics() *TickMetrics {
	tm := &TickMetrics{}
	tm.lastResetTime.Store(time.Now().UnixNano())
	return tm
}

// RecordTick records a new tick and updates metrics
func (tm *TickMetrics) RecordTick() {
	tm.tickCount.Add(1)
}

// CalculateRate calculates the current tick rate and resets if needed
func (tm *TickMetrics) CalculateRate() float64 {
	// Fast path: check if we need to calculate without acquiring mutex
	now := time.Now().UnixNano()
	lastReset := tm.lastResetTime.Load()
	timeDiff := time.Duration(now - lastReset)
	
	// If less than 1 second has passed, return cached value without mutex
	if timeDiff < 1*time.Second {
		cached := tm.ticksPerSecond.Load()
		return float64(cached) / 100.0
	}
	
	// Slow path: need to calculate, acquire mutex
	tm.mutex.Lock()
	defer tm.mutex.Unlock()
	
	// Double-check pattern: verify we still need to calculate after acquiring mutex
	lastReset = tm.lastResetTime.Load()
	timeDiff = time.Duration(now - lastReset)
	if timeDiff >= 1*time.Second {
		tickCount := tm.tickCount.Load()
		ticksPerSecond := float64(tickCount) / timeDiff.Seconds()
		
		// Store as integer (multiplied by 100 for precision)
		tm.ticksPerSecond.Store(int64(ticksPerSecond * 100))
		
		// Reset counters
		tm.tickCount.Store(0)
		tm.lastResetTime.Store(now)
		
		return ticksPerSecond
	}
	
	// Another thread calculated while we were waiting for mutex
	cached := tm.ticksPerSecond.Load()
	return float64(cached) / 100.0
}

// GetCurrentRate returns the current tick rate without calculation
func (tm *TickMetrics) GetCurrentRate() float64 {
	cached := tm.ticksPerSecond.Load()
	return float64(cached) / 100.0
}

// getThrottleInterval returns the throttle interval from environment or default
func getThrottleInterval() time.Duration {
	if fpsStr := os.Getenv("WEBSOCKET_THROTTLE_FPS"); fpsStr != "" {
		if fps, err := strconv.Atoi(fpsStr); err == nil && fps > 0 && fps <= 120 {
			return time.Duration(1000/fps) * time.Millisecond
		}
		log.Printf("⚠️  Invalid WEBSOCKET_THROTTLE_FPS value '%s', using default %d FPS", fpsStr, DefaultThrottleFPS)
	}
	return DefaultThrottleInterval
}

func NewStreamHandler(grpcClient *grpc.Client) *StreamHandler {
	ctx, cancel := context.WithCancel(context.Background())
	
	// Initialize metrics
	metrics := &Metrics{}
	tickMetrics := NewTickMetrics()
	
	// Create worker pool
	workerPool := NewWorkerPool(DefaultMaxWorkers, DefaultWorkQueueSize, ctx)
	
	handler := &StreamHandler{
		grpcClient:    grpcClient,
		clients:       make(map[string]*Client),
		workerPool:    workerPool,
		metrics:       metrics,
		tickMetrics:   tickMetrics,
		ctx:           ctx,
		cancel:        cancel,
		cleanupTicker: time.NewTicker(DefaultCleanupInterval),
		maxClients:    DefaultMaxClients,
	}
	
	// Start the worker pool
	workerPool.Start()
	
	// Start cleanup routine
	go handler.cleanupRoutine()
	
	return handler
}

// NewWorkerPool creates a new worker pool
func NewWorkerPool(maxWorkers, queueSize int, ctx context.Context) *WorkerPool {
	jobQueue := make(chan BroadcastJob, queueSize)
	workerQueue := make(chan chan BroadcastJob, maxWorkers)
	poolCtx, cancel := context.WithCancel(ctx)
	
	return &WorkerPool{
		maxWorkers:  maxWorkers,
		jobQueue:    jobQueue,
		workerQueue: workerQueue,
		workers:     make([]Worker, maxWorkers),
		ctx:         poolCtx,
		cancel:      cancel,
	}
}

// Start initializes and starts all workers in the pool
func (wp *WorkerPool) Start() {
	for i := 0; i < wp.maxWorkers; i++ {
		worker := Worker{
			id:          i + 1,
			workerPool:  wp.workerQueue,
			jobChannel:  make(chan BroadcastJob),
			quit:        make(chan bool),
		}
		wp.workers[i] = worker
		wp.wg.Add(1)
		go worker.start(&wp.wg, wp.ctx)
	}
	
	// Start the dispatcher
	go wp.dispatch()
}

// dispatch distributes jobs to available workers
func (wp *WorkerPool) dispatch() {
	for {
		select {
		case <-wp.ctx.Done():
			return
		case job := <-wp.jobQueue:
			select {
			case workerChannel := <-wp.workerQueue:
				wp.activeJobs.Add(1)
				// Send job to worker with completion callback
				go func() {
					workerChannel <- job
					wp.activeJobs.Add(-1) // Decrement when job is picked up by worker
				}()
			case <-wp.ctx.Done():
				return
			}
		}
	}
}

// Submit adds a job to the worker pool queue
func (wp *WorkerPool) Submit(job BroadcastJob) error {
	select {
	case wp.jobQueue <- job:
		return nil
	case <-wp.ctx.Done():
		return fmt.Errorf("worker pool is shutting down")
	default:
		return fmt.Errorf("job queue is full")
	}
}

// Stop gracefully shuts down the worker pool
func (wp *WorkerPool) Stop() {
	wp.cancel()
	
	// Stop all workers
	for i := range wp.workers {
		wp.workers[i].stop()
	}
	
	// Wait for all workers to finish
	wp.wg.Wait()
	
	// Close channels safely
	defer func() {
		if r := recover(); r != nil {
			// Channel was already closed, ignore
		}
	}()
	
	close(wp.jobQueue)
	close(wp.workerQueue)
}

// start begins the worker's job processing loop
func (w *Worker) start(wg *sync.WaitGroup, ctx context.Context) {
	defer wg.Done()
	
	for {
		// Add this worker to the pool
		w.workerPool <- w.jobChannel
		
		select {
		case <-ctx.Done():
			return
		case job := <-w.jobChannel:
			w.processJob(job)
			// Note: activeJobs counter is managed by the WorkerPool's dispatch method
		case <-w.quit:
			return
		}
	}
}

// processJob handles a broadcast job
func (w *Worker) processJob(job BroadcastJob) {
	defer func() {
		// Decrement active jobs counter (this is managed by the worker pool)
		if r := recover(); r != nil {
			log.Printf("Worker %d panic recovered: %v", w.id, r)
		}
	}()
	
	if !job.client.isActive.Load() {
		return // Skip inactive clients
	}
	
	// Use safe write method to prevent concurrent writes
	job.client.writeMutex.Lock()
	defer job.client.writeMutex.Unlock()

	// Double-check client is still active after acquiring lock
	if !job.client.isActive.Load() {
		return
	}

	// Set write deadline and send data to client
	job.client.conn.SetWriteDeadline(time.Now().Add(DefaultWriteTimeout))
	if err := job.client.conn.WriteMessage(websocket.TextMessage, job.data); err != nil {
		log.Printf("Error sending message to client %s: %v", job.client.id, err)
		job.client.isActive.Store(false)
		job.client.cancel() // Cancel client context
	}
}

// stop stops the worker
func (w *Worker) stop() {
	go func() {
		w.quit <- true
	}()
}

// HandleTickStream handles WebSocket connections for tick streaming
func (h *StreamHandler) HandleTickStream(w http.ResponseWriter, r *http.Request) {
	// Check if we've reached max clients
	if h.metrics.ActiveConnections.Load() >= int64(h.maxClients) {
		http.Error(w, "Maximum clients reached", http.StatusServiceUnavailable)
		h.metrics.DroppedConnections.Add(1)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		h.metrics.DroppedConnections.Add(1)
		return
	}

	// Get start tick from query parameter
	startTick := uint64(0)
	if startTickStr := r.URL.Query().Get("start_tick"); startTickStr != "" {
		if st, err := strconv.ParseUint(startTickStr, 10, 64); err == nil {
			startTick = st
		}
	}

	// Create client with context cancellation
	clientCtx, clientCancel := context.WithCancel(h.ctx)
	clientID := fmt.Sprintf("client_%d_%d", time.Now().UnixNano(), h.metrics.TotalConnections.Add(1))
	
	client := &Client{
		conn:           conn,
		id:             clientID,
		lastPing:       time.Now(),
		ctx:            clientCtx,
		cancel:         clientCancel,
		sendChan:       make(chan []byte, 100), // Buffered channel for async sends
		throttleTicker: time.NewTicker(getThrottleInterval()),
	}
	client.isActive.Store(true)
	client.needsUpdate.Store(false)

	// Register client
	h.clientsMux.Lock()
	h.clients[clientID] = client
	h.clientsMux.Unlock()
	h.metrics.ActiveConnections.Add(1)

	// Setup cleanup
	defer func() {
		client.isActive.Store(false)
		clientCancel()
		client.throttleTicker.Stop() // Stop the throttle ticker
		close(client.sendChan)
		
		h.clientsMux.Lock()
		delete(h.clients, clientID)
		h.clientsMux.Unlock()
		
		h.metrics.ActiveConnections.Add(-1)
		conn.Close()
		
		log.Printf("Client %s disconnected", clientID)
	}()

	log.Printf("WebSocket client %s connected, starting from tick %d", clientID, startTick)

	// Configure connection timeouts
	conn.SetReadDeadline(time.Now().Add(DefaultReadTimeout))
	conn.SetPongHandler(func(string) error {
		client.lastPing = time.Now()
		conn.SetReadDeadline(time.Now().Add(DefaultReadTimeout))
		return nil
	})

	// Start ping/pong handler for connection health
	go h.pingHandler(client)

	// Handle incoming messages (for potential control commands)
	go h.handleIncomingMessages(client)

	// Start throttled tick sender for this client
	go h.throttledTickSender(client)

	// Stream ticks to this client (now using throttled approach)
	err = h.grpcClient.StreamTicksHandler(clientCtx, startTick, func(tick *pb.Tick) error {
		return h.updateLatestTick(client, tick)
	})

	if err != nil && err != context.Canceled {
		log.Printf("Tick streaming error for client %s: %v", clientID, err)
		h.sendErrorToClient(client, err.Error())
	}
}

// handleIncomingMessages handles WebSocket messages from clients
func (h *StreamHandler) handleIncomingMessages(client *Client) {
	defer client.cancel()

	for {
		select {
		case <-client.ctx.Done():
			return
		default:
			messageType, message, err := client.conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Printf("WebSocket read error for client %s: %v", client.id, err)
				}
				return
			}

			client.lastPing = time.Now() // Update last activity

			switch messageType {
			case websocket.TextMessage:
				var msg map[string]interface{}
				if err := json.Unmarshal(message, &msg); err == nil {
					log.Printf("Received message from client %s: %v", client.id, msg)
					// Handle control messages if needed
				}
			case websocket.CloseMessage:
				log.Printf("WebSocket close message received from client %s", client.id)
				return
			case websocket.PingMessage:
				// Respond to ping with pong
				if err := h.safeWriteMessage(client, websocket.PongMessage, nil); err != nil {
					log.Printf("Error sending pong to client %s: %v", client.id, err)
					return
				}
			}
		}
	}
}

// safeWriteJSON safely writes JSON to WebSocket with proper synchronization
func (h *StreamHandler) safeWriteJSON(client *Client, data interface{}) error {
	if !client.isActive.Load() {
		return fmt.Errorf("client %s is inactive", client.id)
	}

	client.writeMutex.Lock()
	defer client.writeMutex.Unlock()

	// Double-check client is still active after acquiring lock
	if !client.isActive.Load() {
		return fmt.Errorf("client %s became inactive", client.id)
	}

	client.conn.SetWriteDeadline(time.Now().Add(DefaultWriteTimeout))
	return client.conn.WriteJSON(data)
}

// safeWriteMessage safely writes a message to WebSocket with proper synchronization
func (h *StreamHandler) safeWriteMessage(client *Client, messageType int, data []byte) error {
	if !client.isActive.Load() {
		return fmt.Errorf("client %s is inactive", client.id)
	}

	client.writeMutex.Lock()
	defer client.writeMutex.Unlock()

	// Double-check client is still active after acquiring lock
	if !client.isActive.Load() {
		return fmt.Errorf("client %s became inactive", client.id)
	}

	client.conn.SetWriteDeadline(time.Now().Add(DefaultWriteTimeout))
	return client.conn.WriteMessage(messageType, data)
}

// updateLatestTick stores the latest tick for throttled sending
func (h *StreamHandler) updateLatestTick(client *Client, tick *pb.Tick) error {
	if !client.isActive.Load() {
		return fmt.Errorf("client %s is inactive", client.id)
	}

	// Record tick for metrics calculation only once per unique tick
	lastTick := h.lastTickNumber.Load()
	if tick.TickNumber > lastTick && h.lastTickNumber.CompareAndSwap(lastTick, tick.TickNumber) {
		h.tickMetrics.RecordTick()
	}

	client.tickMutex.Lock()
	client.latestTick = tick
	client.tickMutex.Unlock()
	
	client.needsUpdate.Store(true)
	return nil
}

// throttledTickSender sends ticks to client at throttled rate (24 FPS)
func (h *StreamHandler) throttledTickSender(client *Client) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Throttled tick sender panic for client %s: %v", client.id, r)
		}
	}()

	for {
		select {
		case <-client.ctx.Done():
			return
		case <-client.throttleTicker.C:
			// Only send if we have an update and client is active
			if client.needsUpdate.Load() && client.isActive.Load() {
				client.tickMutex.RLock()
				tickToSend := client.latestTick
				client.tickMutex.RUnlock()
				
				if tickToSend != nil {
					if err := h.sendTickToClient(client, tickToSend); err != nil {
						log.Printf("Error sending throttled tick to client %s: %v", client.id, err)
						client.isActive.Store(false)
						client.cancel()
						return
					}
					client.needsUpdate.Store(false)
				}
			}
		}
	}
}

// sendTickToClient sends a tick to a specific WebSocket client
func (h *StreamHandler) sendTickToClient(client *Client, tick *pb.Tick) error {
	// Calculate tick rate on-demand at 24fps (merged with throttling)
	tickRate := h.tickMetrics.CalculateRate()
	
	// Convert tick to JSON format with metrics
	tickData := map[string]interface{}{
		"type":        "tick",
		"tick_number": tick.TickNumber,
		"timestamp":   tick.Timestamp,
		"transaction_count": len(tick.Transactions),
		"transaction_batch_hash": tick.TransactionBatchHash,
		"previous_output": tick.PreviousOutput,
		"vdf_proof": map[string]interface{}{
			"input":      tick.VdfProof.Input,
			"output":     tick.VdfProof.Output,
			"proof":      tick.VdfProof.Proof,
			"iterations": tick.VdfProof.Iterations,
		},
		"transactions": h.convertTransactions(tick.Transactions),
		"metrics": map[string]interface{}{
			"ticks_per_second": tickRate,
			"backend_timestamp": time.Now().UnixMilli(),
		},
	}

	// Use safe write method to prevent concurrent writes
	if err := h.safeWriteJSON(client, tickData); err != nil {
		client.isActive.Store(false)
		h.metrics.BroadcastErrors.Add(1)
		return fmt.Errorf("failed to send tick to client %s: %w", client.id, err)
	}

	return nil
}

// sendErrorToClient sends an error message to a WebSocket client
func (h *StreamHandler) sendErrorToClient(client *Client, errorMsg string) error {
	errorData := map[string]interface{}{
		"type":  "error",
		"error": errorMsg,
	}

	return h.safeWriteJSON(client, errorData)
}

// convertTransactions converts protobuf transactions to JSON format
func (h *StreamHandler) convertTransactions(transactions []*pb.OrderedTransaction) []map[string]interface{} {
	result := make([]map[string]interface{}, len(transactions))
	
	for i, tx := range transactions {
		result[i] = map[string]interface{}{
			"tx_id":               tx.Transaction.TxId,
			"sequence_number":     tx.SequenceNumber,
			"nonce":               tx.Transaction.Nonce,
			"ingestion_timestamp": tx.IngestionTimestamp,
			"payload_size":        len(tx.Transaction.Payload),
		}
	}

	return result
}

// BroadcastTick broadcasts a tick to all connected WebSocket clients using worker pool
func (h *StreamHandler) BroadcastTick(tick *pb.Tick) {
	// Convert tick to JSON once for all clients
	tickData := map[string]interface{}{
		"type":        "tick",
		"tick_number": tick.TickNumber,
		"timestamp":   tick.Timestamp,
		"transaction_count": len(tick.Transactions),
		"transaction_batch_hash": tick.TransactionBatchHash,
		"previous_output": tick.PreviousOutput,
		"vdf_proof": map[string]interface{}{
			"input":      tick.VdfProof.Input,
			"output":     tick.VdfProof.Output,
			"proof":      tick.VdfProof.Proof,
			"iterations": tick.VdfProof.Iterations,
		},
		"transactions": h.convertTransactions(tick.Transactions),
	}

	tickJSON, err := json.Marshal(tickData)
	if err != nil {
		log.Printf("Error marshaling tick data: %v", err)
		return
	}

	h.clientsMux.RLock()
	clients := make([]*Client, 0, len(h.clients))
	for _, client := range h.clients {
		if client.isActive.Load() {
			clients = append(clients, client)
		}
	}
	h.clientsMux.RUnlock()

	// Submit broadcast jobs to worker pool
	for _, client := range clients {
		job := BroadcastJob{
			client: client,
			data:   tickJSON,
		}

		if err := h.workerPool.Submit(job); err != nil {
			log.Printf("Error submitting broadcast job for client %s: %v", client.id, err)
			h.metrics.BroadcastErrors.Add(1)
		} else {
			h.metrics.QueuedJobs.Add(1)
		}
	}
}

// pingHandler sends periodic pings to maintain connection health
func (h *StreamHandler) pingHandler(client *Client) {
	ticker := time.NewTicker(DefaultPingInterval)
	defer ticker.Stop()

	for {
		select {
		case <-client.ctx.Done():
			return
		case <-ticker.C:
			if time.Since(client.lastPing) > DefaultPongTimeout+DefaultPingInterval {
				log.Printf("Client %s ping timeout, closing connection", client.id)
				client.isActive.Store(false)
				client.cancel()
				return
			}

			if err := h.safeWriteMessage(client, websocket.PingMessage, nil); err != nil {
				log.Printf("Error sending ping to client %s: %v", client.id, err)
				client.isActive.Store(false)
				client.cancel()
				return
			}
		}
	}
}

// cleanupRoutine periodically cleans up inactive connections
func (h *StreamHandler) cleanupRoutine() {
	for {
		select {
		case <-h.ctx.Done():
			return
		case <-h.cleanupTicker.C:
			h.cleanupInactiveClients()
		}
	}
}

// cleanupInactiveClients removes clients that are no longer active
func (h *StreamHandler) cleanupInactiveClients() {
	h.clientsMux.Lock()
	defer h.clientsMux.Unlock()

	for id, client := range h.clients {
		if !client.isActive.Load() {
			delete(h.clients, id)
			client.cancel()
			client.conn.Close()
			h.metrics.ActiveConnections.Add(-1)
		}
	}
}

// Shutdown gracefully shuts down the StreamHandler
func (h *StreamHandler) Shutdown(ctx context.Context) {
	log.Println("🔌 Starting WebSocket handler shutdown...")
	
	// Stop accepting new connections and cancel existing ones
	h.cancel()
	
	// Stop cleanup ticker
	h.cleanupTicker.Stop()
	
	// Close all client connections gracefully
	h.clientsMux.Lock()
	for id, client := range h.clients {
		client.isActive.Store(false)
		client.cancel()
		
		// Send close message with timeout using safe write
		closeMsg := websocket.FormatCloseMessage(websocket.CloseGoingAway, "Server shutting down")
		h.safeWriteMessage(client, websocket.CloseMessage, closeMsg)
		client.conn.Close()
		
		delete(h.clients, id)
	}
	h.clientsMux.Unlock()
	
	// Stop worker pool
	h.workerPool.Stop()
	
	log.Println("✅ WebSocket handler shutdown complete")
}

// GetMetrics returns current connection metrics
func (h *StreamHandler) GetMetrics() *Metrics {
	return h.metrics
}
