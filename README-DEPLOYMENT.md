# EC2 Deployment Guide

## Quick Start

1. **SSH into your EC2 instance:**
   ```bash
   ssh -i your-key.pem ubuntu@54.178.73.8
   ```

2. **Copy the deployment scripts to your EC2:**
   ```bash
   # From your local machine
   scp -i your-key.pem deploy.sh setup-nginx.sh ubuntu@54.178.73.8:~/
   ```

3. **On the EC2 instance, run:**
   ```bash
   # First time only - setup Nginx
   ./setup-nginx.sh
   
   # Deploy the application
   ./deploy.sh
   ```

## What the scripts do:

### setup-nginx.sh (run once)
- Installs Nginx
- Creates self-signed SSL certificate
- Configures Nginx to proxy requests to your app
- Sets up HTTPS redirect

### deploy.sh (run for each deployment)
- Installs Node.js, Bun, and PM2 if missing
- Clones/updates your repository
- Installs dependencies
- Builds the frontend
- Starts both frontend and backend with PM2
- Ensures services restart on reboot

## Updating your deployment:

1. Make changes to your code locally
2. Push to GitHub
3. SSH into EC2 and run: `./deploy.sh`

## Useful commands on EC2:

```bash
# View running processes
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all

# Stop services
pm2 stop all

# Check Nginx status
sudo systemctl status nginx
```

## Troubleshooting:

- If site not accessible, check EC2 security group allows ports 80 and 443
- For backend API issues, check if it's running: `pm2 logs fermi-backend`
- For frontend issues: `pm2 logs fermi-frontend`