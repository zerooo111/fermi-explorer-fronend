package handlers

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/continuum/backend/internal/grpc"
	"github.com/gorilla/mux"
)

// ValidationError represents a structured validation error
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
	Code    string `json:"code"`
}

// ErrorResponse represents a structured error response
type ErrorResponse struct {
	Error      string            `json:"error"`
	Message    string            `json:"message,omitempty"`
	Errors     []ValidationError `json:"errors,omitempty"`
	Timestamp  int64             `json:"timestamp"`
	RequestID  string            `json:"request_id,omitempty"`
}

// RequestLimits defines various request size and validation limits
type RequestLimits struct {
	MaxRequestSize    int64         // Maximum request body size in bytes
	MaxResponseSize   int64         // Maximum response size in bytes
	Timeout           time.Duration // Request timeout
	MaxTickNumber     uint64        // Maximum valid tick number
	MaxRecentTicks    int           // Maximum number of recent ticks to return
}

// Handler struct with optimized HTTP client and validation
type Handler struct {
	grpcClient   *grpc.Client
	restBaseURL  string
	httpClient   *http.Client // Shared HTTP client with connection pooling
	limits       RequestLimits
	txHashRegex  *regexp.Regexp // Compiled regex for transaction hash validation
}

// Default limits for security and performance
var defaultLimits = RequestLimits{
	MaxRequestSize:  1024 * 1024,    // 1MB
	MaxResponseSize: 10 * 1024 * 1024, // 10MB
	Timeout:         30 * time.Second,
	MaxTickNumber:   1000000000, // 1 billion
	MaxRecentTicks:  1000,
}

// NewHandler creates a new handler with optimized HTTP client and validation
func NewHandler(grpcClient *grpc.Client, restBaseURL string) *Handler {
	// Create optimized HTTP client with connection pooling
	transport := &http.Transport{
		// Connection pooling configuration
		MaxIdleConns:        100,              // Maximum idle connections across all hosts
		MaxIdleConnsPerHost: 10,               // Maximum idle connections per host
		MaxConnsPerHost:     50,               // Maximum connections per host
		IdleConnTimeout:     90 * time.Second, // How long an idle connection is kept
		TLSHandshakeTimeout: 10 * time.Second, // TLS handshake timeout
		ExpectContinueTimeout: 1 * time.Second, // Expect: 100-continue timeout
		
		// TCP connection settings
		DialContext: (&net.Dialer{
			Timeout:   10 * time.Second, // Connection timeout
			KeepAlive: 30 * time.Second, // TCP keep-alive
		}).DialContext,
		
		// Security settings
		TLSClientConfig: &tls.Config{
			MinVersion: tls.VersionTLS12, // Minimum TLS 1.2
		},
		
		// Response header timeout
		ResponseHeaderTimeout: 10 * time.Second,
	}

	httpClient := &http.Client{
		Transport: transport,
		Timeout:   defaultLimits.Timeout,
		// Don't follow redirects for security
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	// Compile transaction hash regex (hexadecimal, 8 characters)
	txHashRegex := regexp.MustCompile(`^[a-fA-F0-9]{8}$`)

	return &Handler{
		grpcClient:  grpcClient,
		restBaseURL: restBaseURL,
		httpClient:  httpClient,
		limits:      defaultLimits,
		txHashRegex: txHashRegex,
	}
}

// validateTransactionHash validates a transaction hash
func (h *Handler) validateTransactionHash(hash string) *ValidationError {
	if hash == "" {
		return &ValidationError{
			Field:   "hash",
			Message: "Transaction hash is required",
			Code:    "required",
		}
	}

	if !h.txHashRegex.MatchString(hash) {
		return &ValidationError{
			Field:   "hash",
			Message: "Transaction hash must be exactly 8 hexadecimal characters",
			Code:    "invalid_format",
		}
	}

	return nil
}

// validateTickNumber validates a tick number
func (h *Handler) validateTickNumber(tickStr string) (uint64, *ValidationError) {
	if tickStr == "" {
		return 0, &ValidationError{
			Field:   "number",
			Message: "Tick number is required",
			Code:    "required",
		}
	}

	tickNum, err := strconv.ParseUint(tickStr, 10, 64)
	if err != nil {
		return 0, &ValidationError{
			Field:   "number",
			Message: "Tick number must be a valid positive integer",
			Code:    "invalid_format",
		}
	}

	if tickNum > h.limits.MaxTickNumber {
		return 0, &ValidationError{
			Field:   "number",
			Message: fmt.Sprintf("Tick number must not exceed %d", h.limits.MaxTickNumber),
			Code:    "out_of_range",
		}
	}

	return tickNum, nil
}

// validateQueryParams validates query parameters for recent ticks endpoint
func (h *Handler) validateQueryParams(r *http.Request) []ValidationError {
	var errors []ValidationError

	// Validate limit parameter
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		limit, err := strconv.Atoi(limitStr)
		if err != nil {
			errors = append(errors, ValidationError{
				Field:   "limit",
				Message: "Limit must be a valid integer",
				Code:    "invalid_format",
			})
		} else if limit < 1 {
			errors = append(errors, ValidationError{
				Field:   "limit",
				Message: "Limit must be greater than 0",
				Code:    "out_of_range",
			})
		} else if limit > h.limits.MaxRecentTicks {
			errors = append(errors, ValidationError{
				Field:   "limit",
				Message: fmt.Sprintf("Limit must not exceed %d", h.limits.MaxRecentTicks),
				Code:    "out_of_range",
			})
		}
	}

	// Validate offset parameter
	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		offset, err := strconv.ParseUint(offsetStr, 10, 64)
		if err != nil {
			errors = append(errors, ValidationError{
				Field:   "offset",
				Message: "Offset must be a valid non-negative integer",
				Code:    "invalid_format",
			})
		} else if offset > h.limits.MaxTickNumber {
			errors = append(errors, ValidationError{
				Field:   "offset",
				Message: fmt.Sprintf("Offset must not exceed %d", h.limits.MaxTickNumber),
				Code:    "out_of_range",
			})
		}
	}

	return errors
}

// sanitizeInput performs basic input sanitization
func sanitizeInput(input string) string {
	// Remove control characters and normalize whitespace
	input = strings.TrimSpace(input)
	// Remove null bytes and other control characters
	input = strings.ReplaceAll(input, "\x00", "")
	return input
}

// sendErrorResponse sends a structured error response with logging
func (h *Handler) sendErrorResponse(w http.ResponseWriter, r *http.Request, statusCode int, message string, validationErrors []ValidationError) {
	response := ErrorResponse{
		Error:     http.StatusText(statusCode),
		Message:   message,
		Errors:    validationErrors,
		Timestamp: time.Now().Unix(),
	}

	// Log the error with context
	log.Printf("❌ [%s %s] %d: %s", r.Method, r.URL.Path, statusCode, message)
	if len(validationErrors) > 0 {
		log.Printf("   Validation errors: %+v", validationErrors)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)
}

// requestSizeLimitMiddleware enforces request size limits
func (h *Handler) requestSizeLimitMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.ContentLength > h.limits.MaxRequestSize {
			h.sendErrorResponse(w, r, http.StatusRequestEntityTooLarge, 
				fmt.Sprintf("Request body too large. Maximum size: %d bytes", h.limits.MaxRequestSize), nil)
			return
		}

		// Limit the request body reader
		r.Body = http.MaxBytesReader(w, r.Body, h.limits.MaxRequestSize)
		next(w, r)
	}
}

// makeSecureRequest makes an HTTP request with security checks and proper error handling
func (h *Handler) makeSecureRequest(ctx context.Context, method, url string, body io.Reader) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, method, url, body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set security headers
	req.Header.Set("User-Agent", "fermi-explorer-proxy/1.0")
	req.Header.Set("Accept", "application/json")
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	// Make the request
	resp, err := h.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}

	// Check response size
	if resp.ContentLength > h.limits.MaxResponseSize {
		resp.Body.Close()
		return nil, fmt.Errorf("response too large: %d bytes", resp.ContentLength)
	}

	return resp, nil
}

// Health check endpoint with enhanced security
func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	// Basic method validation
	if r.Method != http.MethodGet {
		h.sendErrorResponse(w, r, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	response := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().Unix(),
		"version":   "1.0.0",
	}
	
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	json.NewEncoder(w).Encode(response)
}

// Status endpoint - proxies to REST API with enhanced validation and security
func (h *Handler) Status(w http.ResponseWriter, r *http.Request) {
	// Method validation
	if r.Method != http.MethodGet {
		h.sendErrorResponse(w, r, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// Create request context with timeout
	ctx, cancel := context.WithTimeout(r.Context(), h.limits.Timeout)
	defer cancel()

	// Make secure request
	resp, err := h.makeSecureRequest(ctx, http.MethodGet, h.restBaseURL+"/status", nil)
	if err != nil {
		errorMsg := "Failed to get status from sequencer"
		log.Printf("❌ Status endpoint error: %v", err)
		h.sendErrorResponse(w, r, http.StatusServiceUnavailable, errorMsg, nil)
		return
	}
	defer resp.Body.Close()

	// Limit response body size
	limitedReader := io.LimitReader(resp.Body, h.limits.MaxResponseSize)
	
	// Copy the response from the sequencer
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.WriteHeader(resp.StatusCode)
	
	var response interface{}
	if err := json.NewDecoder(limitedReader).Decode(&response); err != nil {
		h.sendErrorResponse(w, r, http.StatusInternalServerError, "Failed to decode sequencer response", nil)
		return
	}
	
	json.NewEncoder(w).Encode(response)
}

// GetTransaction - transaction lookup endpoint with comprehensive validation
func (h *Handler) GetTransaction(w http.ResponseWriter, r *http.Request) {
	// Method validation
	if r.Method != http.MethodGet {
		h.sendErrorResponse(w, r, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	vars := mux.Vars(r)
	txHash := sanitizeInput(vars["hash"])

	// Validate transaction hash
	if validationErr := h.validateTransactionHash(txHash); validationErr != nil {
		h.sendErrorResponse(w, r, http.StatusBadRequest, "Invalid transaction hash", []ValidationError{*validationErr})
		return
	}

	// Create request context with timeout
	ctx, cancel := context.WithTimeout(r.Context(), h.limits.Timeout)
	defer cancel()

	// Make secure request
	resp, err := h.makeSecureRequest(ctx, http.MethodGet, h.restBaseURL+"/tx/"+txHash, nil)
	if err != nil {
		log.Printf("❌ Failed to get transaction %s: %v", txHash, err)
		h.sendErrorResponse(w, r, http.StatusInternalServerError, "Failed to get transaction", nil)
		return
	}
	defer resp.Body.Close()

	// Limit response body size
	limitedReader := io.LimitReader(resp.Body, h.limits.MaxResponseSize)

	// Copy the response from the sequencer
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.WriteHeader(resp.StatusCode)
	
	var response interface{}
	if err := json.NewDecoder(limitedReader).Decode(&response); err != nil {
		h.sendErrorResponse(w, r, http.StatusInternalServerError, "Failed to decode sequencer response", nil)
		return
	}
	
	log.Printf("✅ Successfully retrieved transaction: %s", txHash)
	json.NewEncoder(w).Encode(response)
}

// GetTick - tick lookup endpoint with comprehensive validation
func (h *Handler) GetTick(w http.ResponseWriter, r *http.Request) {
	// Method validation
	if r.Method != http.MethodGet {
		h.sendErrorResponse(w, r, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	vars := mux.Vars(r)
	tickNumStr := sanitizeInput(vars["number"])

	// Validate tick number
	tickNum, validationErr := h.validateTickNumber(tickNumStr)
	if validationErr != nil {
		h.sendErrorResponse(w, r, http.StatusBadRequest, "Invalid tick number", []ValidationError{*validationErr})
		return
	}

	// Create request context with timeout
	ctx, cancel := context.WithTimeout(r.Context(), h.limits.Timeout)
	defer cancel()

	// Make secure request
	resp, err := h.makeSecureRequest(ctx, http.MethodGet, h.restBaseURL+"/tick/"+tickNumStr, nil)
	if err != nil {
		log.Printf("❌ Failed to get tick %d: %v", tickNum, err)
		h.sendErrorResponse(w, r, http.StatusInternalServerError, "Failed to get tick", nil)
		return
	}
	defer resp.Body.Close()

	// Limit response body size
	limitedReader := io.LimitReader(resp.Body, h.limits.MaxResponseSize)

	// Copy the response from the sequencer
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.WriteHeader(resp.StatusCode)
	
	var response interface{}
	if err := json.NewDecoder(limitedReader).Decode(&response); err != nil {
		h.sendErrorResponse(w, r, http.StatusInternalServerError, "Failed to decode sequencer response", nil)
		return
	}
	
	log.Printf("✅ Successfully retrieved tick: %d", tickNum)
	json.NewEncoder(w).Encode(response)
}

// GetRecentTicks - recent ticks endpoint with comprehensive validation
func (h *Handler) GetRecentTicks(w http.ResponseWriter, r *http.Request) {
	// Method validation
	if r.Method != http.MethodGet {
		h.sendErrorResponse(w, r, http.StatusMethodNotAllowed, "Method not allowed", nil)
		return
	}

	// Validate query parameters
	validationErrors := h.validateQueryParams(r)
	if len(validationErrors) > 0 {
		h.sendErrorResponse(w, r, http.StatusBadRequest, "Invalid query parameters", validationErrors)
		return
	}

	// Create request context with timeout
	ctx, cancel := context.WithTimeout(r.Context(), h.limits.Timeout)
	defer cancel()

	// Forward query parameters safely
	url := h.restBaseURL + "/ticks/recent"
	if r.URL.RawQuery != "" {
		// Sanitize and validate query string
		safeQuery := sanitizeInput(r.URL.RawQuery)
		url += "?" + safeQuery
	}

	// Make secure request
	resp, err := h.makeSecureRequest(ctx, http.MethodGet, url, nil)
	if err != nil {
		log.Printf("❌ Failed to get recent ticks: %v", err)
		h.sendErrorResponse(w, r, http.StatusInternalServerError, "Failed to get recent ticks", nil)
		return
	}
	defer resp.Body.Close()

	// Limit response body size
	limitedReader := io.LimitReader(resp.Body, h.limits.MaxResponseSize)

	// Copy the response from the sequencer
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
	w.WriteHeader(resp.StatusCode)
	
	var response interface{}
	if err := json.NewDecoder(limitedReader).Decode(&response); err != nil {
		h.sendErrorResponse(w, r, http.StatusInternalServerError, "Failed to decode sequencer response", nil)
		return
	}
	
	log.Printf("✅ Successfully retrieved recent ticks")
	json.NewEncoder(w).Encode(response)
}


// GetRequestSizeLimitMiddleware returns the request size limit middleware
// This can be used in the main.go to wrap endpoints that need request size validation
func (h *Handler) GetRequestSizeLimitMiddleware() func(http.HandlerFunc) http.HandlerFunc {
	return h.requestSizeLimitMiddleware
}