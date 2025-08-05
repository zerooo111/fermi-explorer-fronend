#!/bin/bash

# Setup backend environment for production

echo "🔧 Setting up backend environment..."

# Create .env file for backend
cat > /home/ubuntu/fermi-explorer/apps/backend/.env << 'EOF'
# Server Configuration
HTTP_PORT=3001
DEBUG=false

# Sequencer Configuration - Update this with your Continuum node IP
# Option 1: If Continuum is running on the same server
CONTINUUM_IP=localhost

# Option 2: If Continuum is running on a different server
# CONTINUUM_IP=YOUR_CONTINUUM_NODE_IP
# Or use individual URLs:
# CONTINUUM_SEQUENCER_URL=YOUR_CONTINUUM_IP:9090
# CONTINUUM_REST_URL=http://YOUR_CONTINUUM_IP:8080/api/v1

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://54.178.73.8,http://54.178.73.8
CORS_ALLOW_CREDENTIALS=false

# Environment
NODE_ENV=production

# WebSocket Configuration
WEBSOCKET_THROTTLE_FPS=30
EOF

echo "✅ Backend environment created!"
echo ""
echo "⚠️  IMPORTANT: Edit /home/ubuntu/fermi-explorer/apps/backend/.env"
echo "    and update CONTINUUM_IP with your Continuum node's IP address"
echo ""
echo "If Continuum is running on this server:"
echo "  - Keep CONTINUUM_IP=localhost"
echo ""
echo "If Continuum is running elsewhere:"
echo "  - Set CONTINUUM_IP=<continuum-node-ip>"
echo ""
echo "After updating, restart the backend:"
echo "  pm2 restart fermi-backend"