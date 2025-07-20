#!/bin/bash

# Quick Deploy Script - Run this locally to deploy to EC2

set -e

# Configuration (UPDATE THESE)
EC2_HOST="YOUR_EC2_IP"
SSH_KEY="path/to/your-key.pem"
EC2_USER="ubuntu"

echo "🚀 Quick deploying to EC2..."

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found at: $SSH_KEY"
    echo "Please update SSH_KEY variable in this script"
    exit 1
fi

# Check if EC2_HOST is set
if [ "$EC2_HOST" = "YOUR_EC2_IP" ]; then
    echo "❌ Please update EC2_HOST in this script with your actual EC2 IP"
    exit 1
fi

# Push latest changes to GitHub
echo "📤 Pushing to GitHub..."
git add .
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push origin main

# Deploy to EC2
echo "🔄 Deploying to EC2..."
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" << 'EOF'
    cd /var/www/fermi-explorer
    git pull origin main
    /home/ubuntu/.bun/bin/bun install
    /home/ubuntu/.bun/bin/bun run build
    pm2 restart all
    pm2 save
    echo "✅ Deployment complete!"
EOF

echo "🌐 Application should be live at: http://$EC2_HOST"
echo "🔧 Backend API: http://$EC2_HOST/api/v1/health"