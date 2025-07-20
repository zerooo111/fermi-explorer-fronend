# 🚀 Deployment Guide

Complete guide for deploying Fermi Explorer to EC2 with automated GitHub deployment.

## Prerequisites

- AWS Account with EC2 access
- GitHub account
- SSH key pair for EC2
- Domain name (optional)

## Phase 1: GitHub Setup

### 1. Create GitHub Repository
1. Go to GitHub and create new repository: `fermi-explorer-monorepo`
2. Copy the repository URL

### 2. Push Code to GitHub
```bash
# Add GitHub remote (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/fermi-explorer-monorepo.git

# Push main branch
git checkout main
git merge feature/monorepo-workspace-migration
git push -u origin main

# Push feature branch too
git checkout feature/monorepo-workspace-migration  
git push -u origin feature/monorepo-workspace-migration
```

## Phase 2: EC2 Setup

### 1. Launch EC2 Instance
1. **AWS Console** → EC2 → Launch Instance
2. **Settings:**
   - Name: `fermi-explorer-server`
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Type: t3.small (recommended) or t2.micro (free tier)
   - Key Pair: Create/select SSH key
   - Security Group Rules:
     ```
     SSH (22)     - Your IP only
     HTTP (80)    - 0.0.0.0/0 
     HTTPS (443)  - 0.0.0.0/0
     Custom (3000) - 0.0.0.0/0  # Frontend
     Custom (3001) - 0.0.0.0/0  # Backend
     ```

### 2. Connect to EC2
```bash
# Make key secure
chmod 400 your-key.pem

# Connect
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### 3. Set Up Server Environment
```bash
# Copy setup script to EC2
scp -i your-key.pem setup-ec2.sh ubuntu@YOUR_EC2_IP:~/

# Run on EC2
chmod +x setup-ec2.sh
./setup-ec2.sh
```

### 4. Deploy Application
```bash
# Update deploy.sh with your repo URL first!
# Then copy to EC2
scp -i your-key.pem deploy.sh ubuntu@YOUR_EC2_IP:~/

# Run on EC2
chmod +x deploy.sh
./deploy.sh
```

### 5. Configure Nginx
```bash
# Copy nginx config to EC2
scp -i your-key.pem nginx-config ubuntu@YOUR_EC2_IP:~/

# On EC2, set up nginx
sudo cp nginx-config /etc/nginx/sites-available/fermi-explorer

# Update with your domain/IP
sudo nano /etc/nginx/sites-available/fermi-explorer

# Enable site
sudo ln -s /etc/nginx/sites-available/fermi-explorer /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## Phase 3: GitHub Actions Setup

### 1. Add GitHub Secrets
Go to GitHub repo → Settings → Secrets and Variables → Actions

Add these secrets:
```
EC2_HOST = your-ec2-public-ip
EC2_USER = ubuntu  
EC2_SSH_KEY = your-private-key-content
```

### 2. Test Automation
```bash
# Make a small change and push to main
echo "# Test deployment" >> README.md
git add README.md
git commit -m "test: trigger deployment"
git push origin main
```

Watch GitHub Actions tab for deployment progress!

## Phase 4: Access Your Application

### URLs
- **Main Site**: `http://YOUR_EC2_IP` or `http://your-domain.com`
- **Frontend Direct**: `http://YOUR_EC2_IP:3000`
- **Backend API**: `http://YOUR_EC2_IP:3001/api/v1/health`
- **WebSocket**: `ws://YOUR_EC2_IP:3001/ws/ticks`

### Server Management Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs
pm2 logs fermi-backend
pm2 logs fermi-frontend

# Restart services
pm2 restart all
pm2 restart fermi-backend
pm2 restart fermi-frontend

# Check nginx
sudo systemctl status nginx
sudo nginx -t

# View nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Phase 5: Optional SSL Setup

### Using Let's Encrypt (Free SSL)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

## Troubleshooting

### Common Issues

1. **Application not starting**
   ```bash
   pm2 logs
   cd /var/www/fermi-explorer
   /home/ubuntu/.bun/bin/bun run dev  # Test manually
   ```

2. **Nginx issues**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   sudo tail -f /var/log/nginx/error.log
   ```

3. **GitHub Actions failing**
   - Check secrets are set correctly
   - Verify EC2 security groups allow SSH from GitHub IPs
   - Check SSH key format (should be the private key content)

4. **Port access issues**
   - Verify EC2 security groups
   - Check if applications are running: `pm2 status`
   - Test local access: `curl http://localhost:3001/api/v1/health`

### Health Checks
```bash
# Test backend health
curl http://YOUR_EC2_IP:3001/api/v1/health

# Test frontend
curl http://YOUR_EC2_IP:3000

# Test through nginx
curl http://YOUR_EC2_IP/api/v1/health
```

## Cost Optimization

### EC2 Instance Types
- **Development**: t2.micro (free tier, limited performance)
- **Production**: t3.small ($15-20/month, good performance)
- **High Traffic**: t3.medium+ (scales with usage)

### Optional Optimizations
- Use AWS Application Load Balancer for high availability
- Set up CloudFront CDN for static assets
- Use RDS for database (when needed)
- Implement auto-scaling groups

## Security Best Practices

1. **SSH Access**: Restrict to your IP only
2. **Application Ports**: Consider restricting 3000/3001 to nginx only
3. **SSL**: Use HTTPS in production
4. **Updates**: Keep system and dependencies updated
5. **Monitoring**: Set up CloudWatch alerts
6. **Backups**: Regular snapshots of EC2 instance

---

🎉 **Your Fermi Explorer is now live with automated deployment!**

Every push to `main` branch will automatically deploy to EC2. 🚀