#!/bin/bash

# EC2 Server Setup Script for Fermi Explorer
# Run this script on your EC2 instance

set -e

echo "🚀 Setting up Fermi Explorer on EC2..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Bun
echo "📦 Installing Bun..."
curl -fsSL https://bun.sh/install | bash
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx for reverse proxy
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/fermi-explorer
sudo chown ubuntu:ubuntu /var/www/fermi-explorer

echo "✅ EC2 setup complete!"
echo "Next steps:"
echo "1. Clone your repository to /var/www/fermi-explorer"
echo "2. Configure environment variables"
echo "3. Set up PM2 processes"
echo "4. Configure Nginx"