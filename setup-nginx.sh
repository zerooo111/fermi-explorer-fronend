#!/bin/bash

# Nginx setup script for Fermi Explorer
# Run this once on your EC2 instance to configure Nginx

set -e

echo "🔧 Setting up Nginx for Fermi Explorer..."

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# Generate self-signed SSL certificate
if [ ! -f /etc/ssl/certs/fermi.crt ]; then
    echo "Generating self-signed SSL certificate..."
    sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl/private/fermi.key \
        -out /etc/ssl/certs/fermi.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=54.178.73.8"
fi

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/fermi-explorer << 'EOF'
server {
    listen 80;
    server_name 54.178.73.8;

    # Redirect all HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name 54.178.73.8;

    # SSL configuration (self-signed for now)
    ssl_certificate /etc/ssl/certs/fermi.crt;
    ssl_certificate_key /etc/ssl/private/fermi.key;

    # Proxy all requests to port 4173
    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API proxy - backend runs on port 3001
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket proxy
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/fermi-explorer /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Nginx setup complete!"
echo "Your site will be available at https://54.178.73.8 after running deploy.sh"