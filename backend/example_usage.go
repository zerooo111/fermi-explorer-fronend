// Example usage demonstrating the optimized handlers
// This file shows how the new validation and HTTP client optimization works
// DO NOT USE IN PRODUCTION - This is for demonstration only

package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/continuum/backend/internal/grpc"
	"github.com/continuum/backend/internal/handlers"
	"github.com/gorilla/mux"
)

func main() {
	// Example of initializing the optimized handler
	grpcClient, err := grpc.NewClient("localhost:9090")
	if err != nil {
		log.Fatalf("Failed to create gRPC client: %v", err)
	}
	defer grpcClient.Close()

	// Create handler with optimized HTTP client and validation
	handler := handlers.NewHandler(grpcClient, "http://localhost:8080/api/v1")

	// Setup router with middleware
	router := mux.NewRouter()
	apiRouter := router.PathPrefix("/api/v1").Subrouter()

	// Health and status endpoints
	apiRouter.HandleFunc("/health", handler.Health).Methods("GET")
	apiRouter.HandleFunc("/status", handler.Status).Methods("GET")

	// Transaction endpoints with validation
	apiRouter.HandleFunc("/tx/{hash}", handler.GetTransaction).Methods("GET")
	

	// Tick endpoints with validation
	apiRouter.HandleFunc("/tick/{number}", handler.GetTick).Methods("GET")
	apiRouter.HandleFunc("/ticks/recent", handler.GetRecentTicks).Methods("GET")

	// Server configuration with timeouts
	server := &http.Server{
		Addr:         ":3001",
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	fmt.Println("🚀 Optimized server running on :3001")
	fmt.Println("📈 Features:")
	fmt.Println("   ✅ Shared HTTP client with connection pooling")
	fmt.Println("   ✅ Comprehensive input validation")
	fmt.Println("   ✅ Request size limits")
	fmt.Println("   ✅ Security hardening")
	fmt.Println("   ✅ Structured error responses")
	fmt.Println("   ✅ Proper logging")

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}

/*
Key Improvements Implemented:

1. SHARED HTTP CLIENT WITH CONNECTION POOLING:
   - Eliminated per-request HTTP client creation
   - Configured connection pooling (100 idle connections, 10 per host)
   - Optimized TCP settings with keep-alive
   - Added timeout configurations
   - Minimum TLS 1.2 for security

2. COMPREHENSIVE INPUT VALIDATION:
   - Transaction hash validation (8 hex characters)
   - Tick number validation with range checking
   - Query parameter validation for recent ticks
   - JSON structure validation for POST requests
   - Input sanitization to prevent injection attacks

3. SECURITY HARDENING:
   - Request size limits (1MB for requests, 10MB for responses)
   - Content-Type validation for POST requests
   - Structured error responses with validation details
   - No automatic redirect following
   - Proper cache control headers

4. ERROR HANDLING & LOGGING:
   - Structured error responses with error codes
   - Comprehensive logging with context
   - Consistent HTTP status codes
   - Validation error details in responses

5. PERFORMANCE OPTIMIZATIONS:
   - Connection reuse through pooling
   - Response caching headers where appropriate
   - Limited response body reading
   - Context-based timeouts

Example API calls that will now be properly validated:

✅ Valid requests:
GET /api/v1/tx/abcdef12         (8 hex characters)
GET /api/v1/tick/12345          (valid number)
GET /api/v1/ticks/recent?limit=10&offset=0

❌ Invalid requests (will return 400 with validation errors):
GET /api/v1/tx/abc              (too short)
GET /api/v1/tx/xyz123gh         (invalid hex)
GET /api/v1/tick/abc            (not a number)
GET /api/v1/tick/-1             (negative number)
GET /api/v1/ticks/recent?limit=9999 (exceeds max limit)
POST /api/v1/tx with invalid JSON
POST /api/v1/tx with >1MB body
*/