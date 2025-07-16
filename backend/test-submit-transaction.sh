#!/bin/bash

# Test script for SubmitTransaction gRPC endpoint

# Default values
GRPC_ADDR="${CONTINUUM_SEQUENCER_URL:-localhost:9090}"
TX_COUNT=5
PAYLOAD="Test transaction from Go client"
VERBOSE=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --addr)
      GRPC_ADDR="$2"
      shift 2
      ;;
    --count)
      TX_COUNT="$2"
      shift 2
      ;;
    --payload)
      PAYLOAD="$2"
      shift 2
      ;;
    -v|--verbose)
      VERBOSE="-v"
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [options]"
      echo "Options:"
      echo "  --addr <address>      gRPC server address (default: localhost:9090 or CONTINUUM_SEQUENCER_URL from dev.env)"
      echo "  --count <n>           Number of transactions to submit (default: 5)"
      echo "  --payload <text>      Transaction payload text (default: 'Test transaction from Go client')"
      echo "  -v, --verbose         Enable verbose output"
      echo "  -h, --help            Show this help message"
      echo ""
      echo "Note: If dev.env exists and CONTINUUM_SEQUENCER_URL is not set, it will be sourced automatically."
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use -h or --help for usage information"
      exit 1
      ;;
  esac
done

echo "🚀 Continuum Sequencer - SubmitTransaction Test"
echo "=============================================="

# Source dev.env if it exists and CONTINUUM_SEQUENCER_URL is not set
if [ -f "dev.env" ] && [ -z "$CONTINUUM_SEQUENCER_URL" ]; then
    echo "📦 Loading dev.env configuration..."
    source dev.env
    GRPC_ADDR="$CONTINUUM_SEQUENCER_URL"
fi

echo "Server: $GRPC_ADDR"
echo "Transaction Count: $TX_COUNT"
echo "Payload: $PAYLOAD"
echo ""

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go to run this test."
    exit 1
fi

# Build and run the test
echo "📦 Building test client..."
if go build -o submit_tx_test submit_transaction_client.go; then
    echo "✅ Build successful"
    echo ""
    echo "🧪 Running tests..."
    echo "==================="
    ./submit_tx_test -addr="$GRPC_ADDR" -count=$TX_COUNT -payload="$PAYLOAD" $VERBOSE
    
    # Clean up
    rm -f submit_tx_test
else
    echo "❌ Build failed"
    exit 1
fi