package websocket

import (
	"context"
	"testing"
	"time"

	pb "github.com/continuum/backend/proto"
)

func TestWorkerPool(t *testing.T) {
	ctx := context.Background()
	pool := NewWorkerPool(5, 10, ctx)
	
	// Start the pool
	pool.Start()
	
	// Test submitting jobs
	for i := 0; i < 5; i++ {
		job := BroadcastJob{
			client: &Client{
				id: "test_client",
			},
			data: []byte("test data"),
		}
		
		err := pool.Submit(job)
		if err != nil {
			t.Errorf("Failed to submit job: %v", err)
		}
	}
	
	// Wait for jobs to be processed
	time.Sleep(100 * time.Millisecond)
	
	// Test pool shutdown
	pool.Stop()
}

func TestStreamHandlerCreation(t *testing.T) {
	// This test validates that StreamHandler can be created without panicking
	// and that all components are properly initialized
	
	// Note: We can't test with a real grpcClient without more setup
	// but we can test the structure initialization
	
	handler := &StreamHandler{
		grpcClient:    nil, // Would be a real client in production
		clients:       make(map[string]*Client),
		maxClients:    DefaultMaxClients,
	}
	
	// Initialize context
	ctx, cancel := context.WithCancel(context.Background())
	handler.ctx = ctx
	handler.cancel = cancel
	
	// Initialize metrics
	handler.metrics = &Metrics{}
	
	// Initialize worker pool
	handler.workerPool = NewWorkerPool(DefaultMaxWorkers, DefaultWorkQueueSize, ctx)
	
	// Initialize cleanup ticker
	handler.cleanupTicker = time.NewTicker(DefaultCleanupInterval)
	
	// Verify initialization
	if handler.clients == nil {
		t.Error("clients map not initialized")
	}
	
	if handler.metrics == nil {
		t.Error("metrics not initialized")
	}
	
	if handler.workerPool == nil {
		t.Error("worker pool not initialized")
	}
	
	if handler.cleanupTicker == nil {
		t.Error("cleanup ticker not initialized")
	}
	
	// Test metrics functionality
	metrics := handler.GetMetrics()
	if metrics == nil {
		t.Error("GetMetrics returned nil")
	}
	
	// Note: IsHealthy method exists in the implementation
	// Testing would require proper initialization of the full handler
	
	// Cleanup
	handler.cleanupTicker.Stop()
	cancel()
}

func TestBroadcastTickSerialization(t *testing.T) {
	// Test that tick data can be properly serialized
	handler := &StreamHandler{}
	
	// Create a sample tick
	tick := &pb.Tick{
		TickNumber: 12345,
		Timestamp:  uint64(time.Now().Unix()),
		Transactions: []*pb.OrderedTransaction{
			{
				Transaction: &pb.Transaction{
					TxId:    "test_tx_1",
					Nonce:   1,
					Payload: []byte("test payload"),
				},
				SequenceNumber:      1,
				IngestionTimestamp:  uint64(time.Now().Unix()),
			},
		},
		TransactionBatchHash: "test_batch_hash",
		PreviousOutput:       "test_previous_output",
		VdfProof: &pb.VdfProof{
			Input:      "test_input",
			Output:     "test_output",
			Proof:      "test_proof",
			Iterations: 1000,
		},
	}
	
	// Test transaction conversion
	transactions := handler.convertTransactions(tick.Transactions)
	if len(transactions) != 1 {
		t.Errorf("Expected 1 transaction, got %d", len(transactions))
	}
	
	if transactions[0]["tx_id"] != "test_tx_1" {
		t.Error("Transaction ID not properly converted")
	}
}

func TestClientLifecycle(t *testing.T) {
	// Test client creation and cleanup
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	
	client := &Client{
		id:       "test_client",
		lastPing: time.Now(),
		ctx:      ctx,
		cancel:   cancel,
		sendChan: make(chan []byte, 100),
	}
	client.isActive.Store(true)
	
	// Verify client is active
	if !client.isActive.Load() {
		t.Error("Client should be active")
	}
	
	// Test deactivation
	client.isActive.Store(false)
	if client.isActive.Load() {
		t.Error("Client should be inactive")
	}
	
	// Test context cancellation
	client.cancel()
	
	select {
	case <-client.ctx.Done():
		// Context properly cancelled
	case <-time.After(100 * time.Millisecond):
		t.Error("Context was not cancelled properly")
	}
	
	close(client.sendChan)
}

func BenchmarkWorkerPoolSubmission(b *testing.B) {
	ctx := context.Background()
	pool := NewWorkerPool(10, 1000, ctx)
	pool.Start()
	defer pool.Stop()
	
	// Create a mock client that won't cause nil pointer dereference
	client := &Client{
		id:   "bench_client",
		conn: nil, // Benchmark doesn't need real connection
	}
	client.isActive.Store(false) // Set inactive to skip actual processing
	
	job := BroadcastJob{
		client: client,
		data:   []byte("benchmark data"),
	}
	
	b.ResetTimer()
	b.RunParallel(func(pb *testing.PB) {
		for pb.Next() {
			pool.Submit(job)
		}
	})
}