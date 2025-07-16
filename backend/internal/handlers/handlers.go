package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/continuum/backend/internal/grpc"
	"github.com/gorilla/mux"
)

type Handler struct {
	grpcClient *grpc.Client
	restBaseURL string
}

func NewHandler(grpcClient *grpc.Client, restBaseURL string) *Handler {
	return &Handler{
		grpcClient: grpcClient,
		restBaseURL: restBaseURL,
	}
}

// Health check endpoint
func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().Unix(),
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Status endpoint - proxies to REST API
func (h *Handler) Status(w http.ResponseWriter, r *http.Request) {
	client := &http.Client{Timeout: 10 * time.Second}
	
	resp, err := client.Get(h.restBaseURL + "/status")
	if err != nil {
		errorMsg := fmt.Sprintf("Failed to get status from sequencer: %v", err)
		log.Printf("❌ Status endpoint error: %v", err)
		
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error": errorMsg,
			"status": "sequencer_unavailable",
		})
		return
	}
	defer resp.Body.Close()

	// Copy the response from the sequencer
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	
	var response interface{}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error": "Failed to decode sequencer response",
		})
		return
	}
	
	json.NewEncoder(w).Encode(response)
}

// Transaction lookup endpoint - proxies to REST API
func (h *Handler) GetTransaction(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	txHash := vars["hash"]

	if len(txHash) != 8 {
		http.Error(w, "Transaction hash must be 8 characters", http.StatusBadRequest)
		return
	}

	client := &http.Client{Timeout: 10 * time.Second}
	
	resp, err := client.Get(h.restBaseURL + "/tx/" + txHash)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get transaction: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Copy the response from the sequencer
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	
	var response interface{}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error": "Failed to decode sequencer response",
		})
		return
	}
	
	json.NewEncoder(w).Encode(response)
}

// Tick lookup endpoint - proxies to REST API
func (h *Handler) GetTick(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tickNumStr := vars["number"]

	// Validate tick number
	if _, err := strconv.ParseUint(tickNumStr, 10, 64); err != nil {
		http.Error(w, "Invalid tick number", http.StatusBadRequest)
		return
	}

	client := &http.Client{Timeout: 10 * time.Second}
	
	resp, err := client.Get(h.restBaseURL + "/tick/" + tickNumStr)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get tick: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Copy the response from the sequencer
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	
	var response interface{}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error": "Failed to decode sequencer response",
		})
		return
	}
	
	json.NewEncoder(w).Encode(response)
}

// Recent ticks endpoint - proxies to REST API
func (h *Handler) GetRecentTicks(w http.ResponseWriter, r *http.Request) {
	client := &http.Client{Timeout: 10 * time.Second}
	
	// Forward query parameters
	url := h.restBaseURL + "/ticks/recent"
	if r.URL.RawQuery != "" {
		url += "?" + r.URL.RawQuery
	}
	
	resp, err := client.Get(url)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get recent ticks: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Copy the response from the sequencer
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	
	var response interface{}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error": "Failed to decode sequencer response",
		})
		return
	}
	
	json.NewEncoder(w).Encode(response)
}

// Submit transaction endpoint - proxies to REST API
func (h *Handler) SubmitTransaction(w http.ResponseWriter, r *http.Request) {
	client := &http.Client{Timeout: 10 * time.Second}
	
	// Forward the request body to the sequencer
	resp, err := client.Post(h.restBaseURL + "/tx", "application/json", r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to submit transaction: %v", err), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Copy the response from the sequencer
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	
	var response interface{}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error": "Failed to decode sequencer response",
		})
		return
	}
	
	json.NewEncoder(w).Encode(response)
}