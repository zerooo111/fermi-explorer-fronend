package handlers

import (
	"log"
	"net/http"
	"runtime/debug"
	"time"
)

// PanicRecoveryMiddleware recovers from panics and logs them with structured information
func PanicRecoveryMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				// Log the panic with structured information
				log.Printf("🚨 PANIC RECOVERED: %v", err)
				log.Printf("Request: %s %s", r.Method, r.URL.Path)
				log.Printf("Remote Address: %s", r.RemoteAddr)
				log.Printf("User Agent: %s", r.UserAgent())
				log.Printf("Stack trace:\n%s", debug.Stack())

				// Respond with a generic error message to avoid exposing internal details
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				
				// Write error response
				if _, writeErr := w.Write([]byte(`{"error": "Internal server error", "status": "server_error", "timestamp": "` + time.Now().UTC().Format(time.RFC3339) + `"}`)); writeErr != nil {
					log.Printf("Failed to write error response: %v", writeErr)
				}
			}
		}()

		next.ServeHTTP(w, r)
	})
}