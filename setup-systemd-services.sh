#!/bin/bash

# Setup script for Fermi Explorer systemd services on Ubuntu EC2

set -e

echo "Setting up Fermi Explorer systemd services..."

# Create log directories
sudo mkdir -p /var/log/fermi-backend
sudo mkdir -p /var/log/fermi-frontend
sudo chown ubuntu:ubuntu /var/log/fermi-backend
sudo chown ubuntu:ubuntu /var/log/fermi-frontend

# Install bun if not already installed
if ! command -v bun &> /dev/null; then
    echo "Installing bun..."
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
fi

# Build the applications
echo "Building applications..."
cd /home/ubuntu/fermi-explorer-monorepo

# Install dependencies
bun install

# Build backend
cd apps/backend
bun run build

# Build frontend
cd ../frontend
bun run build

# Copy service files
cd /home/ubuntu/fermi-explorer-monorepo
sudo cp fermi-backend.service /etc/systemd/system/
sudo cp fermi-frontend.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable and start services
echo "Enabling and starting services..."
sudo systemctl enable fermi-backend.service
sudo systemctl enable fermi-frontend.service
sudo systemctl start fermi-backend.service
sudo systemctl start fermi-frontend.service

# Check service status
echo "Checking service status..."
sudo systemctl status fermi-backend.service --no-pager
sudo systemctl status fermi-frontend.service --no-pager

echo "Setup complete! Services are running."
echo ""
echo "Useful commands:"
echo "  - Check backend logs: sudo journalctl -u fermi-backend -f"
echo "  - Check frontend logs: sudo journalctl -u fermi-frontend -f"
echo "  - Restart backend: sudo systemctl restart fermi-backend"
echo "  - Restart frontend: sudo systemctl restart fermi-frontend"
echo "  - View backend logs: tail -f /var/log/fermi-backend/backend.log"
echo "  - View frontend logs: tail -f /var/log/fermi-frontend/frontend.log"