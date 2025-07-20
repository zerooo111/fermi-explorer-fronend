# 🚀 Fermi Explorer Quick Start Guide

## One-Command Startup

Get the entire Fermi Explorer monorepo running with a single command:

```bash
./start.sh
```

## What It Does

The `start.sh` script automatically:
- ✅ Checks prerequisites (Bun, Node.js)
- ✅ Installs workspace dependencies
- ✅ Builds shared packages (@fermi/*)
- ✅ Builds and starts backend on port 3001
- ✅ Starts frontend on port 3000
- ✅ Sets up environment variables
- ✅ Monitors service health
- ✅ Provides centralized logging
- ✅ Handles graceful shutdown

## Usage Options

### Basic Commands
```bash
./start.sh                    # Start both services
./start.sh --help             # Show all options
./start.sh --check            # Check if services are running
./start.sh --stop             # Stop all services
```

### Service-Specific
```bash
./start.sh --backend-only     # Start only backend
./start.sh --frontend-only    # Start only frontend
```

### Configuration
```bash
./start.sh --debug            # Enable debug logging
./start.sh --backend-port 3002 # Custom backend port
./start.sh --frontend-port 3001 # Custom frontend port
```

## Environment Variables

Set these before running if you need custom configuration:

```bash
# Backend
export BACKEND_PORT=3001
export CONTINUUM_REST_URL=http://localhost:8080/api/v1
export CONTINUUM_SEQUENCER_URL=localhost:9090

# Frontend
export FRONTEND_PORT=3000
export DEBUG=true

# Then start
./start.sh
```

## Service Management

### Logs
- Backend: `logs/backend.log`
- Frontend: `logs/frontend.log`

### Process Control
- Backend PID: `/tmp/fermi-backend.pid`
- Frontend PID: `/tmp/fermi-frontend.pid`

### Health Checks
- Backend: http://localhost:3001/api/v1/health
- Frontend: http://localhost:3000

## Stopping Services

### Graceful Shutdown
```bash
# In the terminal where start.sh is running
Ctrl+C
```

### Force Stop
```bash
./start.sh --stop
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3001
lsof -i :3000

# Stop conflicting services
./start.sh --stop
```

### Services Not Starting
```bash
# Check logs
cat logs/backend.log
cat logs/frontend.log

# Check service status
./start.sh --check

# Start with debug mode
./start.sh --debug
```

### Clean Start
```bash
# Stop everything
./start.sh --stop

# Clean workspace
rm -rf node_modules apps/*/node_modules apps/*/dist packages/*/dist apps/frontend/dist

# Start again
./start.sh
```

## Development Workflow

### Quick Development Cycle
```bash
# Start services
./start.sh

# Make changes to code
# Services will auto-reload on changes
# Shared packages rebuild automatically

# Stop when done
Ctrl+C
```

### Alternative: Direct Workspace Commands
```bash
# Install all workspace dependencies
bun install

# Build all packages (including shared ones)
bun run build

# Start development mode for all apps
bun run dev
```

### Backend Only Development
```bash
# Start just backend for API development
./start.sh --backend-only --debug

# Or use workspace command
bun run --filter '@fermi/backend' dev
```

### Frontend Only Development
```bash
# Start just frontend (assumes backend is running elsewhere)
./start.sh --frontend-only --debug

# Or use workspace command
bun run --filter '@fermi/frontend' dev
```

## Success Indicators

When everything is working, you'll see:
- ✅ Backend started successfully
- ✅ Frontend started successfully
- 🌐 Frontend: http://localhost:3000
- 🔧 Backend: http://localhost:3001
- 📊 Health: http://localhost:3001/api/v1/health

## Need Help?

```bash
./start.sh --help
```

Or check the main [README.md](README.md) for detailed documentation.