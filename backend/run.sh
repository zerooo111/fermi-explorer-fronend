#!/bin/bash

# Simple Continuum Backend Runner

set -e

# Default values
HTTP_PORT=3001
GRPC_ADDR="localhost:9090"
DEBUG=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--port)
            HTTP_PORT="$2"
            shift 2
            ;;
        -g|--grpc)
            GRPC_ADDR="$2"
            shift 2
            ;;
        -d|--debug)
            DEBUG=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -p, --port PORT       HTTP server port (default: 3001)"
            echo "  -g, --grpc ADDR       gRPC server address (default: localhost:9090)"
            echo "  -d, --debug           Enable debug mode"
            echo "  -h, --help           Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    # Run with defaults"
            echo "  $0 -d                 # Run in debug mode"
            echo "  $0 -p 3002            # Run on port 3002"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "🚀 Continuum Backend Proxy"

# Check if dev.env exists and offer to source it
if [ -f "dev.env" ] && [ "$DEBUG" != "true" ]; then
    echo "💡 Tip: Run 'source dev.env' for development environment"
fi

# Download dependencies
echo "📦 Downloading dependencies..."
go mod download

# Build the application
echo "🔨 Building..."
go build -o proxy ./cmd/proxy

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Set debug environment if requested
if [ "$DEBUG" = true ]; then
    export DEBUG=true
    export GO_ENV=development
    export RUST_LOG=debug
    export GIN_MODE=debug
    echo "🐛 Debug mode enabled"
fi

# Kill any existing process on the port
echo "🔍 Checking for existing process on port $HTTP_PORT..."
PID=$(lsof -ti:$HTTP_PORT)
if [ ! -z "$PID" ]; then
    echo "⚠️  Found existing process $PID on port $HTTP_PORT, killing it..."
    kill -9 $PID
    sleep 1
fi

# Run the proxy
echo "🌐 Starting server on port $HTTP_PORT"
echo "📡 Connecting to gRPC at $GRPC_ADDR"
echo "Press Ctrl+C to stop"
echo ""

./proxy -port "$HTTP_PORT" -grpc "$GRPC_ADDR"