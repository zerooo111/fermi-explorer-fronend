#!/bin/bash

# Deployment Script for EC2
# Run this script on EC2 after setup-ec2.sh

set -e

APP_DIR="/var/www/fermi-explorer"
REPO_URL="https://github.com/YOUR_USERNAME/fermi-explorer-monorepo.git"  # Update this

echo "🚀 Deploying Fermi Explorer..."

# Navigate to app directory
cd $APP_DIR

# Clone or pull latest code
if [ ! -d ".git" ]; then
    echo "📥 Cloning repository..."
    git clone $REPO_URL .
else
    echo "📥 Pulling latest changes..."
    git pull origin main
fi

# Install dependencies
echo "📦 Installing dependencies..."
/home/ubuntu/.bun/bin/bun install

# Build the application
echo "🔨 Building application..."
/home/ubuntu/.bun/bin/bun run build

# Copy environment file if it doesn't exist
if [ ! -f "apps/backend/.env" ]; then
    echo "📝 Creating environment file..."
    cp apps/backend/.env.example apps/backend/.env
    echo "⚠️  Please update apps/backend/.env with your configuration"
fi

# Set up PM2 processes
echo "🔄 Setting up PM2 processes..."

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'fermi-backend',
      script: '/home/ubuntu/.bun/bin/bun',
      args: 'run start',
      cwd: '/var/www/fermi-explorer/apps/backend',
      env: {
        NODE_ENV: 'production',
        HTTP_PORT: 3001
      },
      error_file: '/var/log/fermi-backend-error.log',
      out_file: '/var/log/fermi-backend-out.log',
      log_file: '/var/log/fermi-backend.log',
      time: true
    },
    {
      name: 'fermi-frontend',
      script: 'serve',
      args: '-s dist -l 3000',
      cwd: '/var/www/fermi-explorer/apps/frontend',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/fermi-frontend-error.log',
      out_file: '/var/log/fermi-frontend-out.log',
      log_file: '/var/log/fermi-frontend.log',
      time: true
    }
  ]
};
EOF

# Install serve for frontend
sudo npm install -g serve

# Start PM2 processes
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Deployment complete!"
echo "🌐 Frontend should be running on port 3000"
echo "🔧 Backend should be running on port 3001"
echo "📊 Check status with: pm2 status"
echo "📝 Check logs with: pm2 logs"