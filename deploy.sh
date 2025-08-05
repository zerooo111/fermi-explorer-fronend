#!/bin/bash

# Simple EC2 deployment script for Fermi Explorer
# Run this script on your EC2 instance after SSH-ing in

set -e  # Exit on error

echo "🚀 Starting Fermi Explorer deployment..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/zerooo111/fermi-explorer-monorepo.git"  # UPDATE THIS
DEPLOY_DIR="/home/ubuntu/fermi-explorer"
BRANCH="main"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running on EC2
if [ ! -f /etc/os-release ]; then
    print_error "This script should be run on the EC2 instance"
    exit 1
fi

# Install dependencies if not already installed
print_status "Checking system dependencies..."
if ! command -v git &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y git
fi

if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v bun &> /dev/null; then
    print_status "Installing Bun..."
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc
fi

if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    sudo npm install -g pm2
fi

# Clone or update repository
if [ -d "$DEPLOY_DIR" ]; then
    print_status "Updating existing repository..."
    cd "$DEPLOY_DIR"
    git fetch origin
    git reset --hard origin/$BRANCH
    git pull origin $BRANCH
else
    print_status "Cloning repository..."
    git clone -b $BRANCH "$REPO_URL" "$DEPLOY_DIR"
    cd "$DEPLOY_DIR"
fi

# Install all dependencies using bun (supports workspaces)
print_status "Installing all dependencies with bun..."
cd "$DEPLOY_DIR"
bun install

# Fix workspace dependencies (temporary workaround for production)
print_status "Fixing workspace dependencies..."
if [ -f "$DEPLOY_DIR/fix-workspaces.sh" ]; then
    bash "$DEPLOY_DIR/fix-workspaces.sh"
else
    # Create symlinks manually if script doesn't exist
    mkdir -p node_modules/@fermi
    ln -sf ../../packages/shared-utils node_modules/@fermi/shared-utils
    ln -sf ../../packages/shared-types node_modules/@fermi/shared-types  
    ln -sf ../../packages/config node_modules/@fermi/config
    
    mkdir -p apps/backend/node_modules/@fermi
    ln -sf ../../../../packages/shared-utils apps/backend/node_modules/@fermi/shared-utils
    ln -sf ../../../../packages/shared-types apps/backend/node_modules/@fermi/shared-types
    ln -sf ../../../../packages/config apps/backend/node_modules/@fermi/config
    
    mkdir -p apps/frontend/node_modules/@fermi
    ln -sf ../../../../packages/shared-utils apps/frontend/node_modules/@fermi/shared-utils
    ln -sf ../../../../packages/shared-types apps/frontend/node_modules/@fermi/shared-types
    ln -sf ../../../../packages/config apps/frontend/node_modules/@fermi/config
fi

# Build frontend (skip TypeScript check for MVP)
print_status "Building frontend..."
cd "$DEPLOY_DIR/apps/frontend"
bun run vite build

# Stop existing processes
print_status "Stopping existing processes..."
pm2 stop all || true
pm2 delete all || true

# Kill any processes using our ports
print_status "Cleaning up ports..."
sudo fuser -k 3001/tcp || true
sudo fuser -k 4173/tcp || true
sleep 2  # Give time for ports to be released

# Start backend
print_status "Starting backend..."
cd "$DEPLOY_DIR/apps/backend"
HTTP_PORT=3001 pm2 start bun --name "fermi-backend" -- run start

# Start frontend preview server
print_status "Starting frontend..."
cd "$DEPLOY_DIR/apps/frontend"
pm2 start bun --name "fermi-frontend" -- run serve -- --host 0.0.0.0 --port 4173

# Save PM2 configuration
pm2 save
pm2 startup | grep sudo | bash

# Show status
print_status "Deployment complete!"
echo ""
echo "Services status:"
pm2 status

echo ""
echo "📝 Notes:"
echo "- Frontend is running on port 4173"
echo "- Backend is running on port 3000"
echo "- Make sure your Nginx configuration is set up correctly"
echo "- You can view logs with: pm2 logs"
echo "- To restart services: pm2 restart all"
echo ""
echo "🌐 Your app should be accessible at: https://54.178.73.8"