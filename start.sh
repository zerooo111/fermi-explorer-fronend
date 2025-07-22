#!/bin/bash

set -e

# Cleanup processes on exit
cleanup() {
    echo "Stopping services..."
    pkill -f "bun.*dev" || true
}

trap cleanup EXIT INT TERM

echo "Starting Fermi Explorer..."
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Start backend and frontend in parallel
(cd apps/backend && bun dev) &
(cd apps/frontend && bun dev) &

# Wait for processes
wait