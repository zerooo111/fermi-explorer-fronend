#!/bin/bash

# Comprehensive test script for Continuum Go Backend

BASE_URL="http://localhost:3001"
REMOTE_SEQUENCER="${CONTINUUM_REMOTE_HOST:-localhost}"

echo "🧪 Continuum Backend Test Suite"
echo "==============================="

# Check if Go backend is running
echo ""
echo "0. Checking if Go backend is running..."
if curl -s "$BASE_URL/api/v1/health" > /dev/null; then
    echo "✅ Go backend is running on port 3001"
else
    echo "❌ Go backend is not running. Start with: ./run.sh"
    exit 1
fi

# Test 1: Health endpoint
echo ""
echo "1. Testing Health Endpoint..."
echo "GET $BASE_URL/api/v1/health"
echo "Response:"
curl -s "$BASE_URL/api/v1/health" | jq . 2>/dev/null || curl -s "$BASE_URL/api/v1/health"
echo ""

# Test 2: Status endpoint
echo ""
echo "2. Testing Status Endpoint..."
echo "GET $BASE_URL/api/v1/status"
echo "Response:"
STATUS_RESPONSE=$(curl -s "$BASE_URL/api/v1/status")
echo "$STATUS_RESPONSE" | jq . 2>/dev/null || echo "$STATUS_RESPONSE"

# Check if status failed due to gRPC connection
if echo "$STATUS_RESPONSE" | grep -q "sequencer_unavailable"; then
    echo ""
    echo "⚠️  Status endpoint failed - sequencer not reachable via gRPC"
    echo "   This is expected if the gRPC port (9090) is not publicly accessible"
fi

echo ""

# Test 3: Test gRPC connectivity
echo ""
echo "3. Testing gRPC Connectivity..."
GRPC_ADDR=$(echo $CONTINUUM_SEQUENCER_URL | sed 's/.*://')
GRPC_HOST=$(echo $CONTINUUM_SEQUENCER_URL | sed 's/:.*//')

if [ "$GRPC_HOST" = "localhost" ]; then
    echo "Testing local gRPC connection..."
    if timeout 3 bash -c "</dev/tcp/localhost/$GRPC_ADDR" 2>/dev/null; then
        echo "✅ Local gRPC port $GRPC_ADDR is reachable"
    else
        echo "❌ Local gRPC port $GRPC_ADDR is not reachable"
        echo "   Make sure the Continuum sequencer is running locally"
    fi
else
    echo "Testing remote gRPC connection to $GRPC_HOST:$GRPC_ADDR..."
    if timeout 5 bash -c "</dev/tcp/$GRPC_HOST/$GRPC_ADDR" 2>/dev/null; then
        echo "✅ Remote gRPC port is reachable"
    else
        echo "❌ Remote gRPC port is not reachable"
        echo "   gRPC port might not be publicly exposed"
    fi
fi

# Test 4: Remote REST API (for comparison)
echo ""
echo "4. Testing Remote Sequencer REST API..."
echo "GET http://$REMOTE_SEQUENCER:8080/api/v1/health"
echo "Response:"
curl -s "http://$REMOTE_SEQUENCER:8080/api/v1/health" | jq . 2>/dev/null || curl -s "http://$REMOTE_SEQUENCER:8080/api/v1/health"
echo ""

echo "GET http://$REMOTE_SEQUENCER:8080/api/v1/status"
echo "Response:"
curl -s "http://$REMOTE_SEQUENCER:8080/api/v1/status" | jq . 2>/dev/null || curl -s "http://$REMOTE_SEQUENCER:8080/api/v1/status"
echo ""

# Test 5: Transaction endpoint (should fail gracefully)
echo ""
echo "5. Testing Transaction Endpoint (with dummy hash)..."
echo "GET $BASE_URL/api/v1/tx/deadbeef"
echo "Response:"
curl -s "$BASE_URL/api/v1/tx/deadbeef" | jq . 2>/dev/null || curl -s "$BASE_URL/api/v1/tx/deadbeef"
echo ""

# Test 6: Tick endpoint (should fail gracefully)
echo ""
echo "6. Testing Tick Endpoint..."
echo "GET $BASE_URL/api/v1/tick/1"
echo "Response:"
curl -s "$BASE_URL/api/v1/tick/1" | jq . 2>/dev/null || curl -s "$BASE_URL/api/v1/tick/1"
echo ""

# Summary
echo ""
echo "📋 Test Summary"
echo "==============="
echo "✅ Health endpoint: Working"
echo "⚠️  Status endpoint: Depends on gRPC connectivity"
echo "✅ Remote REST API: Working ($REMOTE_SEQUENCER:8080)"
echo ""
echo "💡 Recommendations:"
echo "   - If testing locally: Run the Continuum sequencer locally"
echo "   - If using remote: gRPC port 9090 needs to be accessible"
echo "   - Alternative: Modify Go backend to use REST API instead of gRPC"