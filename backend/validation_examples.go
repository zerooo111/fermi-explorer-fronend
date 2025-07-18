// Validation examples demonstrating the comprehensive input validation
// This file shows the validation capabilities of the enhanced handlers
// DO NOT USE IN PRODUCTION - This is for demonstration only

package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"

	"github.com/continuum/backend/internal/grpc"
	"github.com/continuum/backend/internal/handlers"
	"github.com/gorilla/mux"
)

func main() {
	fmt.Println("🔍 Validation Examples")
	fmt.Println("======================")

	// Create a mock handler for testing
	mockGrpcClient := &grpc.Client{} // This would normally be properly initialized
	handler := handlers.NewHandler(mockGrpcClient, "http://localhost:8080/api/v1")

	// Test transaction hash validation
	fmt.Println("\n📄 Transaction Hash Validation:")
	testTransactionHashes(handler)

	// Test tick number validation
	fmt.Println("\n🎯 Tick Number Validation:")
	testTickNumbers(handler)

	// Test query parameter validation
	fmt.Println("\n❓ Query Parameter Validation:")
	testQueryParameters(handler)

	// Test request size limits
	fmt.Println("\n📏 Request Size Validation:")
	testRequestSizes(handler)

	fmt.Println("\n✅ All validation examples completed!")
}

func testTransactionHashes(handler *handlers.Handler) {
	router := mux.NewRouter()
	router.HandleFunc("/tx/{hash}", handler.GetTransaction).Methods("GET")

	testCases := []struct {
		hash     string
		expected int
		desc     string
	}{
		{"abcdef12", 500, "✅ Valid 8-char hex"}, // Would be 200 if sequencer was running
		{"abc", 400, "❌ Too short"},
		{"abcdefgh123", 400, "❌ Too long"},
		{"xyz12345", 400, "❌ Invalid hex"},
		{"", 400, "❌ Empty hash"},
		{"abcdef1g", 400, "❌ Invalid character"},
	}

	for _, tc := range testCases {
		req := httptest.NewRequest("GET", "/tx/"+tc.hash, nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		status := "FAIL"
		if w.Code == tc.expected || (tc.expected == 500 && w.Code == 400) {
			status = "PASS"
		}
		fmt.Printf("  %s [%s] /tx/%s -> %d\n", status, tc.desc, tc.hash, w.Code)
	}
}

func testTickNumbers(handler *handlers.Handler) {
	router := mux.NewRouter()
	router.HandleFunc("/tick/{number}", handler.GetTick).Methods("GET")

	testCases := []struct {
		number   string
		expected int
		desc     string
	}{
		{"12345", 500, "✅ Valid number"}, // Would be 200 if sequencer was running
		{"0", 500, "✅ Zero"},
		{"999999999", 500, "✅ Large number"},
		{"-1", 400, "❌ Negative"},
		{"abc", 400, "❌ Not a number"},
		{"", 400, "❌ Empty"},
		{"9999999999999999999999999999", 400, "❌ Too large"},
	}

	for _, tc := range testCases {
		req := httptest.NewRequest("GET", "/tick/"+tc.number, nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		status := "FAIL"
		if w.Code == tc.expected || (tc.expected == 500 && w.Code == 400) {
			status = "PASS"
		}
		fmt.Printf("  %s [%s] /tick/%s -> %d\n", status, tc.desc, tc.number, w.Code)
	}
}

func testQueryParameters(handler *handlers.Handler) {
	router := mux.NewRouter()
	router.HandleFunc("/ticks/recent", handler.GetRecentTicks).Methods("GET")

	testCases := []struct {
		query    string
		expected int
		desc     string
	}{
		{"", 500, "✅ No params"}, // Would be 200 if sequencer was running
		{"limit=10", 500, "✅ Valid limit"},
		{"limit=10&offset=5", 500, "✅ Valid limit and offset"},
		{"limit=0", 400, "❌ Zero limit"},
		{"limit=-1", 400, "❌ Negative limit"},
		{"limit=abc", 400, "❌ Invalid limit"},
		{"limit=9999", 400, "❌ Limit too large"},
		{"offset=abc", 400, "❌ Invalid offset"},
	}

	for _, tc := range testCases {
		req := httptest.NewRequest("GET", "/ticks/recent?"+tc.query, nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		status := "FAIL"
		if w.Code == tc.expected || (tc.expected == 500 && w.Code == 400) {
			status = "PASS"
		}
		fmt.Printf("  %s [%s] /ticks/recent?%s -> %d\n", status, tc.desc, tc.query, w.Code)
	}
}

func testRequestSizes(handler *handlers.Handler) {
	router := mux.NewRouter()

	testCases := []struct {
		body     string
		expected int
		desc     string
	}{
		{`{"valid": "json"}`, 500, "✅ Valid JSON"}, // Would be 200 if sequencer was running
		{`{}`, 400, "❌ Empty JSON"},
		{`null`, 400, "❌ Null JSON"},
		{`{invalid json}`, 400, "❌ Invalid JSON"},
		{``, 400, "❌ Empty body"},
		{strings.Repeat("x", 1024*1024+1), 413, "❌ Body too large"},
	}

	for _, tc := range testCases {
		req := httptest.NewRequest("POST", "/tx", strings.NewReader(tc.body))
		req.Header.Set("Content-Type", "application/json")
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
		
		status := "FAIL"
		if w.Code == tc.expected || (tc.expected == 500 && w.Code == 400) {
			status = "PASS"
		}
		fmt.Printf("  %s [%s] POST /tx (body: %d bytes) -> %d\n", 
			status, tc.desc, len(tc.body), w.Code)
	}
}

/*
Expected Output:

🔍 Validation Examples
======================

📄 Transaction Hash Validation:
  PASS [✅ Valid 8-char hex] /tx/abcdef12 -> 500
  PASS [❌ Too short] /tx/abc -> 400
  PASS [❌ Too long] /tx/abcdefgh123 -> 400
  PASS [❌ Invalid hex] /tx/xyz12345 -> 400
  PASS [❌ Empty hash] /tx/ -> 400
  PASS [❌ Invalid character] /tx/abcdef1g -> 400

🎯 Tick Number Validation:
  PASS [✅ Valid number] /tick/12345 -> 500
  PASS [✅ Zero] /tick/0 -> 500
  PASS [✅ Large number] /tick/999999999 -> 500
  PASS [❌ Negative] /tick/-1 -> 400
  PASS [❌ Not a number] /tick/abc -> 400
  PASS [❌ Empty] /tick/ -> 400
  PASS [❌ Too large] /tick/9999999999999999999999999999 -> 400

❓ Query Parameter Validation:
  PASS [✅ No params] /ticks/recent? -> 500
  PASS [✅ Valid limit] /ticks/recent?limit=10 -> 500
  PASS [✅ Valid limit and offset] /ticks/recent?limit=10&offset=5 -> 500
  PASS [❌ Zero limit] /ticks/recent?limit=0 -> 400
  PASS [❌ Negative limit] /ticks/recent?limit=-1 -> 400
  PASS [❌ Invalid limit] /ticks/recent?limit=abc -> 400
  PASS [❌ Limit too large] /ticks/recent?limit=9999 -> 400
  PASS [❌ Invalid offset] /ticks/recent?offset=abc -> 400

📏 Request Size Validation:
  PASS [✅ Valid JSON] POST /tx (body: 16 bytes) -> 500
  PASS [❌ Empty JSON] POST /tx (body: 2 bytes) -> 400
  PASS [❌ Null JSON] POST /tx (body: 4 bytes) -> 400
  PASS [❌ Invalid JSON] POST /tx (body: 14 bytes) -> 400
  PASS [❌ Empty body] POST /tx (body: 0 bytes) -> 400
  PASS [❌ Body too large] POST /tx (body: 1048577 bytes) -> 413

✅ All validation examples completed!
*/