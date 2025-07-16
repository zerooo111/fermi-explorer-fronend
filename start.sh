#!/bin/bash

# Fermi Explorer Monorepo Unified Startup Script
# This script starts both the backend and frontend services together

set -e

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
    echo "📄 Loading environment variables from .env file..."
    # Use a safer method to load .env that handles spaces and quotes
    while IFS='=' read -r key value; do
        # Skip empty lines and comments
        [[ -z "$key" || "$key" =~ ^#.* ]] && continue
        # Remove quotes from value if present
        value=$(echo "$value" | sed 's/^["'"'"']\(.*\)["'"'"']$/\1/')
        export "$key=$value"
        echo "  ✓ $key=$value"
    done < .env
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT="${BACKEND_PORT:-3001}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
LOG_DIR="logs"
DEBUG_MODE="${DEBUG:-false}"

# PID files for process management
BACKEND_PID_FILE="/tmp/fermi-backend.pid"
FRONTEND_PID_FILE="/tmp/fermi-frontend.pid"

# Log files
mkdir -p "$LOG_DIR"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

# Function to print colored output
print_status() {
    echo -e "${CYAN}[$(date '+%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')]${NC} ✅ $1"
}

print_error() {
    echo -e "${RED}[$(date '+%H:%M:%S')]${NC} ❌ $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')]${NC} ⚠️  $1"
}

print_info() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} ℹ️  $1"
}

# Function to check if a port is available
check_port() {
    local port=$1
    
    # Try multiple methods to check if port is in use
    # Method 1: Try to connect with nc (netcat)
    if command -v nc >/dev/null 2>&1; then
        if nc -z localhost $port 2>/dev/null; then
            return 1  # Port is in use
        fi
    fi
    
    # Method 2: Try with lsof if available
    if command -v lsof >/dev/null 2>&1; then
        if lsof -i :$port >/dev/null 2>&1; then
            return 1  # Port is in use
        fi
    fi
    
    # Method 3: Try with netstat (only check for LISTEN state)
    if command -v netstat >/dev/null 2>&1; then
        if netstat -an 2>/dev/null | grep -q "[:.]$port.*LISTEN"; then
            return 1  # Port is in use
        fi
    fi
    
    # Method 4: Try with ss
    if command -v ss >/dev/null 2>&1; then
        if ss -ln 2>/dev/null | grep -q ":$port "; then
            return 1  # Port is in use
        fi
    fi
    
    return 0  # Port is available
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=0
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 1
    done
    
    print_error "$service_name failed to start within 30 seconds"
    return 1
}

# Function to cleanup processes on exit
cleanup() {
    print_status "Shutting down services..."
    
    # Kill backend process
    if [ -f "$BACKEND_PID_FILE" ]; then
        local backend_pid=$(cat "$BACKEND_PID_FILE")
        if kill -0 "$backend_pid" 2>/dev/null; then
            print_status "Stopping backend (PID: $backend_pid)"
            kill "$backend_pid" 2>/dev/null || true
            wait "$backend_pid" 2>/dev/null || true
        fi
        rm -f "$BACKEND_PID_FILE"
    fi
    
    # Kill frontend process
    if [ -f "$FRONTEND_PID_FILE" ]; then
        local frontend_pid=$(cat "$FRONTEND_PID_FILE")
        if kill -0 "$frontend_pid" 2>/dev/null; then
            print_status "Stopping frontend (PID: $frontend_pid)"
            kill "$frontend_pid" 2>/dev/null || true
            wait "$frontend_pid" 2>/dev/null || true
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    # Kill any remaining processes on our ports
    # Try multiple methods to find processes using the ports
    local backend_processes=""
    local frontend_processes=""
    
    # Method 1: Try with lsof if available
    if command -v lsof >/dev/null 2>&1; then
        backend_processes=$(lsof -ti:$BACKEND_PORT 2>/dev/null || true)
        frontend_processes=$(lsof -ti:$FRONTEND_PORT 2>/dev/null || true)
    fi
    
    # Method 2: Try with netstat and extract PIDs
    if [ -z "$backend_processes" ] && command -v netstat >/dev/null 2>&1; then
        backend_processes=$(netstat -tulpn 2>/dev/null | grep ":$BACKEND_PORT " | awk '{print $7}' | cut -d'/' -f1 | grep -v '-' || true)
    fi
    
    if [ -z "$frontend_processes" ] && command -v netstat >/dev/null 2>&1; then
        frontend_processes=$(netstat -tulpn 2>/dev/null | grep ":$FRONTEND_PORT " | awk '{print $7}' | cut -d'/' -f1 | grep -v '-' || true)
    fi
    
    if [ -n "$backend_processes" ]; then
        print_status "Killing remaining processes on port $BACKEND_PORT"
        echo "$backend_processes" | xargs kill -9 2>/dev/null || true
    fi
    
    if [ -n "$frontend_processes" ]; then
        print_status "Killing remaining processes on port $FRONTEND_PORT"
        echo "$frontend_processes" | xargs kill -9 2>/dev/null || true
    fi
    
    print_success "Cleanup complete"
}

# Function to show help
show_help() {
    cat << EOF
${CYAN}Fermi Explorer Monorepo Startup Script${NC}

${YELLOW}Usage:${NC}
  ./start.sh [OPTIONS]

${YELLOW}Options:${NC}
  -h, --help           Show this help message
  -d, --debug          Enable debug mode
  -b, --backend-only   Start only the backend service
  -f, --frontend-only  Start only the frontend service
  -p, --backend-port   Backend port (default: 3001)
  -P, --frontend-port  Frontend port (default: 3000)
  -c, --check          Check if services are running
  -s, --stop           Stop all running services

${YELLOW}Environment Variables:${NC}
  BACKEND_PORT         Backend server port (default: 3001)
  FRONTEND_PORT        Frontend server port (default: 3000)
  DEBUG                Enable debug logging (default: false)
  CONTINUUM_IP         Sequencer IP address (auto-builds gRPC:9090 & REST:8080/api/v1)
  CONTINUUM_SEQUENCER_URL  Sequencer gRPC URL (fallback: localhost:9090)
  CONTINUUM_REST_URL   Sequencer REST URL (fallback: http://localhost:8080/api/v1)

${YELLOW}Examples:${NC}
  ./start.sh                    # Start both services
  ./start.sh --debug            # Start with debug logging
  ./start.sh --backend-only     # Start only backend
  ./start.sh --frontend-only    # Start only frontend
  ./start.sh --check            # Check service status
  ./start.sh --stop             # Stop all services
  
  # Using simple IP configuration:
  CONTINUUM_IP=192.168.1.100 ./start.sh
  
  # Using individual URLs (fallback):
  CONTINUUM_SEQUENCER_URL=custom-host:9090 ./start.sh

EOF
}

# Function to check service status
check_services() {
    echo -e "${CYAN}=== Service Status ===${NC}"
    
    # Check backend
    if check_port $BACKEND_PORT; then
        print_error "Backend (port $BACKEND_PORT): Not running"
    else
        if curl -s "http://localhost:$BACKEND_PORT/api/v1/health" >/dev/null 2>&1; then
            print_success "Backend (port $BACKEND_PORT): Running and healthy"
        else
            print_warning "Backend (port $BACKEND_PORT): Running but not responding"
        fi
    fi
    
    # Check frontend
    if check_port $FRONTEND_PORT; then
        print_error "Frontend (port $FRONTEND_PORT): Not running"
    else
        print_success "Frontend (port $FRONTEND_PORT): Running"
    fi
}

# Function to stop services
stop_services() {
    print_status "Stopping all services..."
    cleanup
    exit 0
}

# Function to start backend
start_backend() {
    print_status "Starting backend service..."
    
    # Check if backend directory exists
    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "Backend directory '$BACKEND_DIR' not found"
        exit 1
    fi
    
    # Check if port is available
    if ! check_port $BACKEND_PORT; then
        print_error "Port $BACKEND_PORT is already in use"
        exit 1
    fi
    
    # Change to backend directory
    cd "$BACKEND_DIR"
    
    # Check if Go is installed
    if ! command -v go &> /dev/null; then
        print_error "Go is not installed. Please install Go 1.21 or later."
        exit 1
    fi
    
    # Check if go.mod exists
    if [ ! -f "go.mod" ]; then
        print_error "go.mod not found in backend directory"
        exit 1
    fi
    
    # Download dependencies
    print_status "Installing backend dependencies..."
    go mod download
    
    # Build the backend
    print_status "Building backend..."
    go build -o proxy ./cmd/proxy
    
    # Set debug mode if enabled
    local debug_flag=""
    if [ "$DEBUG_MODE" = "true" ]; then
        debug_flag="-debug"
        export DEBUG=true
    fi
    
    # Determine gRPC and REST configuration
    if [ -n "$CONTINUUM_IP" ]; then
        local grpc_addr="${CONTINUUM_IP}:9090"
        local rest_addr="http://${CONTINUUM_IP}:8080/api/v1"
        print_status "Using CONTINUUM_IP: $CONTINUUM_IP"
        print_status "gRPC endpoint: $grpc_addr"
        print_status "REST endpoint: $rest_addr"
    else
        local grpc_addr="${CONTINUUM_SEQUENCER_URL:-localhost:9090}"
        local rest_addr="${CONTINUUM_REST_URL:-http://localhost:8080/api/v1}"
        print_status "Using individual endpoint configuration"
        print_status "gRPC endpoint: $grpc_addr"
        print_status "REST endpoint: $rest_addr"
    fi
    
    # Start backend in background
    print_status "Starting backend server on port $BACKEND_PORT..."
    ./proxy -port "$BACKEND_PORT" $debug_flag > "../$BACKEND_LOG" 2>&1 &
    local backend_pid=$!
    
    # Return to root directory first
    cd ..
    
    # Write PID file from root directory
    echo $backend_pid > "$BACKEND_PID_FILE"
    
    # Wait for backend to be ready
    if wait_for_service "http://localhost:$BACKEND_PORT/api/v1/health" "Backend"; then
        print_success "Backend started successfully (PID: $backend_pid)"
        print_info "Backend logs: $BACKEND_LOG"
        print_info "Backend health: http://localhost:$BACKEND_PORT/api/v1/health"
    else
        print_error "Backend failed to start"
        cleanup
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    print_status "Starting frontend service..."
    
    # Check if frontend directory exists
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "Frontend directory '$FRONTEND_DIR' not found"
        exit 1
    fi
    
    # Check if port is available
    if ! check_port $FRONTEND_PORT; then
        print_error "Port $FRONTEND_PORT is already in use"
        exit 1
    fi
    
    # Change to frontend directory
    cd "$FRONTEND_DIR"
    
    # Check if bun is installed
    if ! command -v bun &> /dev/null; then
        print_error "Bun is not installed. Please install Bun."
        exit 1
    fi
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in frontend directory"
        exit 1
    fi
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    bun install
    
    # Set environment variables
    export VITE_API_BASE="http://localhost:$BACKEND_PORT"
    if [ "$DEBUG_MODE" = "true" ]; then
        export VITE_ENABLE_LOGGING=true
        export VITE_ENABLE_DEV_TOOLS=true
    fi
    
    # Start frontend in background
    print_status "Starting frontend server on port $FRONTEND_PORT..."
    bun run start > "../$FRONTEND_LOG" 2>&1 &
    local frontend_pid=$!
    
    # Return to root directory first
    cd ..
    
    # Write PID file from root directory
    echo $frontend_pid > "$FRONTEND_PID_FILE"
    
    # Wait for frontend to be ready
    if wait_for_service "http://localhost:$FRONTEND_PORT" "Frontend"; then
        print_success "Frontend started successfully (PID: $frontend_pid)"
        print_info "Frontend logs: $FRONTEND_LOG"
        print_info "Frontend URL: http://localhost:$FRONTEND_PORT"
    else
        print_error "Frontend failed to start"
        cleanup
        exit 1
    fi
}

# Main function
main() {
    local backend_only=false
    local frontend_only=false
    local check_only=false
    local stop_only=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -d|--debug)
                DEBUG_MODE="true"
                shift
                ;;
            -b|--backend-only)
                backend_only=true
                shift
                ;;
            -f|--frontend-only)
                frontend_only=true
                shift
                ;;
            -p|--backend-port)
                BACKEND_PORT="$2"
                shift 2
                ;;
            -P|--frontend-port)
                FRONTEND_PORT="$2"
                shift 2
                ;;
            -c|--check)
                check_only=true
                shift
                ;;
            -s|--stop)
                stop_only=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Handle special modes
    if [ "$check_only" = "true" ]; then
        check_services
        exit 0
    fi
    
    if [ "$stop_only" = "true" ]; then
        stop_services
        exit 0
    fi
    
    # Set up signal handlers for cleanup
    trap cleanup EXIT INT TERM
    
    # Print startup banner
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════════════════════════════╗"
    echo "║                              🚀 Fermi Explorer Startup                               ║"
    echo "║                                                                                      ║"
    echo "║  A comprehensive blockchain data explorer for the Continuum Sequencer network       ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    print_info "Backend Port: $BACKEND_PORT"
    print_info "Frontend Port: $FRONTEND_PORT"
    print_info "Debug Mode: $DEBUG_MODE"
    print_info "Log Directory: $LOG_DIR"
    
    # Start services based on options
    if [ "$backend_only" = "true" ]; then
        start_backend
    elif [ "$frontend_only" = "true" ]; then
        start_frontend
    else
        # Start both services
        start_backend
        start_frontend
    fi
    
    # Print success message
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════════════════════════╗"
    echo "║                              🎉 All Services Started!                               ║"
    echo "║                                                                                      ║"
    if [ "$backend_only" != "true" ] && [ "$frontend_only" != "true" ]; then
        echo "║  🌐 Frontend: http://localhost:$FRONTEND_PORT                                          ║"
        echo "║  🔧 Backend:  http://localhost:$BACKEND_PORT                                          ║"
        echo "║  📊 Health:   http://localhost:$BACKEND_PORT/api/v1/health                           ║"
    elif [ "$backend_only" = "true" ]; then
        echo "║  🔧 Backend:  http://localhost:$BACKEND_PORT                                          ║"
        echo "║  📊 Health:   http://localhost:$BACKEND_PORT/api/v1/health                           ║"
    else
        echo "║  🌐 Frontend: http://localhost:$FRONTEND_PORT                                          ║"
    fi
    echo "║                                                                                      ║"
    echo "║  Press Ctrl+C to stop all services                                                  ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Keep the script running and monitor services
    while true; do
        sleep 5
        
        # Check if backend is still running (if it was started)
        if [ "$frontend_only" != "true" ] && [ -f "$BACKEND_PID_FILE" ]; then
            local backend_pid=$(cat "$BACKEND_PID_FILE")
            if ! kill -0 "$backend_pid" 2>/dev/null; then
                print_error "Backend process died unexpectedly"
                cleanup
                exit 1
            fi
        fi
        
        # Check if frontend is still running (if it was started)
        if [ "$backend_only" != "true" ] && [ -f "$FRONTEND_PID_FILE" ]; then
            local frontend_pid=$(cat "$FRONTEND_PID_FILE")
            if ! kill -0 "$frontend_pid" 2>/dev/null; then
                print_error "Frontend process died unexpectedly"
                cleanup
                exit 1
            fi
        fi
    done
}

# Run main function with all arguments
main "$@"