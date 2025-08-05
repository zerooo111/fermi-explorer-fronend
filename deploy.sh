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

# Build frontend
print_status "Building frontend..."
cd "$DEPLOY_DIR/apps/frontend"
bun run build

# Stop existing processes
print_status "Stopping existing processes..."
pm2 stop all || true

# Start backend
print_status "Starting backend..."
cd "$DEPLOY_DIR/apps/backend"
HTTP_PORT=3001 pm2 start bun --name "fermi-backend" -- run start

# Start frontend preview server
print_status "Starting frontend..."
cd "$DEPLOY_DIR/apps/frontend"
pm2 start bun --name "fermi-frontend" -- run preview --host 0.0.0.0 --port 4173

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