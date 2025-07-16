package websocket

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"sync"

	"github.com/continuum/backend/internal/grpc"
	"github.com/gorilla/websocket"
	pb "github.com/continuum/backend/proto"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow all origins for development
		// In production, you should restrict this
		return true
	},
}

type StreamHandler struct {
	grpcClient *grpc.Client
	clients    map[*websocket.Conn]bool
	clientsMux sync.RWMutex
}

func NewStreamHandler(grpcClient *grpc.Client) *StreamHandler {
	return &StreamHandler{
		grpcClient: grpcClient,
		clients:    make(map[*websocket.Conn]bool),
	}
}

// HandleTickStream handles WebSocket connections for tick streaming
func (h *StreamHandler) HandleTickStream(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	// Get start tick from query parameter
	startTick := uint64(0)
	if startTickStr := r.URL.Query().Get("start_tick"); startTickStr != "" {
		if st, err := strconv.ParseUint(startTickStr, 10, 64); err == nil {
			startTick = st
		}
	}

	// Register client
	h.clientsMux.Lock()
	h.clients[conn] = true
	h.clientsMux.Unlock()

	defer func() {
		h.clientsMux.Lock()
		delete(h.clients, conn)
		h.clientsMux.Unlock()
	}()

	log.Printf("WebSocket client connected, starting from tick %d", startTick)

	// Start streaming ticks
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Handle incoming messages (for potential control commands)
	go h.handleIncomingMessages(conn, cancel)

	// Stream ticks to this client
	err = h.grpcClient.StreamTicksHandler(ctx, startTick, func(tick *pb.Tick) error {
		return h.sendTickToClient(conn, tick)
	})

	if err != nil {
		log.Printf("Tick streaming error: %v", err)
		h.sendErrorToClient(conn, err.Error())
	}
}

// handleIncomingMessages handles WebSocket messages from clients
func (h *StreamHandler) handleIncomingMessages(conn *websocket.Conn, cancel context.CancelFunc) {
	defer cancel()

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket read error: %v", err)
			}
			break
		}

		switch messageType {
		case websocket.TextMessage:
			var msg map[string]interface{}
			if err := json.Unmarshal(message, &msg); err == nil {
				log.Printf("Received message: %v", msg)
				// Handle control messages if needed
			}
		case websocket.CloseMessage:
			log.Println("WebSocket close message received")
			return
		}
	}
}

// sendTickToClient sends a tick to a specific WebSocket client
func (h *StreamHandler) sendTickToClient(conn *websocket.Conn, tick *pb.Tick) error {
	// Convert tick to JSON format
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

	return conn.WriteJSON(tickData)
}

// sendErrorToClient sends an error message to a WebSocket client
func (h *StreamHandler) sendErrorToClient(conn *websocket.Conn, errorMsg string) error {
	errorData := map[string]interface{}{
		"type":  "error",
		"error": errorMsg,
	}

	return conn.WriteJSON(errorData)
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

// BroadcastTick broadcasts a tick to all connected WebSocket clients
func (h *StreamHandler) BroadcastTick(tick *pb.Tick) {
	h.clientsMux.RLock()
	defer h.clientsMux.RUnlock()

	for conn := range h.clients {
		go func(c *websocket.Conn) {
			if err := h.sendTickToClient(c, tick); err != nil {
				log.Printf("Error sending tick to client: %v", err)
				// Remove client on error
				h.clientsMux.Lock()
				delete(h.clients, c)
				h.clientsMux.Unlock()
				c.Close()
			}
		}(conn)
	}
}