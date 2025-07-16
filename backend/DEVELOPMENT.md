# Development Guide

This guide covers development workflows for the Continuum Go Backend Proxy.

## Quick Start

### 1. Basic Run
```bash
# Standard run
./run.sh

# Or using Makefile
make run
```

### 2. Debug Mode
```bash
# Run with debug logging and detailed output
./run.sh -d

# Or using Makefile
make debug
```

### 3. Development Mode
```bash
# Run with full development features
./run.sh --dev

# Or using Makefile
make dev
```

### 4. Watch Mode (Auto-restart)
```bash
# Auto-restart on file changes
./run.sh -w

# Or using Makefile
make watch
```

## Development Modes

### Debug Mode (`-d` or `--debug`)
- Enables detailed logging
- Adds debug middleware
- Shows request/response details
- Includes timing information
- Adds debug headers to responses

### Development Mode (`--dev`)
- Includes all debug features
- Sets `GO_ENV=development`
- Enables additional development tools
- More verbose error messages

### Watch Mode (`-w` or `--watch`)
- Automatically restarts on file changes
- Uses `air` for hot reloading (if available)
- Falls back to `fswatch` or `inotifywait`
- Includes all development features

## Environment Setup

### Load Development Environment
```bash
# Load development environment variables
source dev.env

# Then run normally
./proxy
```

### Manual Environment Variables
```bash
export DEBUG=true
export GO_ENV=development
export RUST_LOG=debug
export GODEBUG=gctrace=1

./proxy -debug
```

## Development Tools

### Install Development Tools
```bash
# Install hot reload tool
go install github.com/cosmtrek/air@latest

# Install linter
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Or use Makefile
make install-tools
```

### File Watching Tools
The watch mode supports multiple file watching tools:

1. **air** (recommended): `go install github.com/cosmtrek/air@latest`
2. **fswatch** (macOS): `brew install fswatch`
3. **inotifywait** (Linux): `sudo apt-get install inotify-tools`

## Debugging Features

### Request Logging
In debug mode, all HTTP requests are logged with:
- Method and URL
- Status code
- Response time
- User agent
- Request headers
- Remote address

### Debug Headers
Debug mode adds these headers to all responses:
- `X-Debug-Mode: true`
- `X-Server-Time: <timestamp>`

### gRPC Debug Logging
- Set `RUST_LOG=debug` for detailed gRPC logs
- Enable `GODEBUG=gctrace=1` for Go garbage collection traces

## Common Development Workflows

### 1. Feature Development
```bash
# Start with watch mode for rapid iteration
./run.sh -w

# Make changes to code
# Server automatically restarts
```

### 2. API Testing
```bash
# Run in debug mode to see request details
./run.sh -d

# Test endpoints
curl -v http://localhost:8080/api/v1/health
curl -v http://localhost:8080/api/v1/status
```

### 3. WebSocket Testing
```bash
# Run in debug mode
./run.sh -d

# Connect to WebSocket (in another terminal)
websocat ws://localhost:8080/ws/ticks
```

### 4. Testing with Different Sequencer
```bash
# Connect to remote sequencer
./run.sh -d -g remote-sequencer:9090

# Or with custom port
./run.sh -d -p 8081 -g localhost:9091
```

## Build Variants

### Debug Build
```bash
# Build with debug symbols (no optimizations)
make build-debug

# Or directly
go build -gcflags=all="-N -l" -o proxy ./cmd/proxy
```

### Production Build
```bash
# Optimized build
make build

# Or directly
go build -ldflags="-s -w" -o proxy ./cmd/proxy
```

## Testing

### Run Tests
```bash
# Run all tests
make test

# Run tests with coverage
make test-coverage

# Run specific test
go test -v ./internal/handlers
```

### Manual Testing
```bash
# Health check
curl http://localhost:8080/api/v1/health

# Status check
curl http://localhost:8080/api/v1/status

# WebSocket test
websocat ws://localhost:8080/ws/ticks?start_tick=0
```

## Profiling

### CPU Profiling
```bash
# Enable CPU profiling
go build -o proxy ./cmd/proxy
./proxy -cpuprofile=cpu.prof

# Analyze profile
go tool pprof cpu.prof
```

### Memory Profiling
```bash
# Enable memory profiling
go build -o proxy ./cmd/proxy
./proxy -memprofile=mem.prof

# Analyze profile
go tool pprof mem.prof
```

## Common Issues

### 1. Connection Refused
```bash
# Check if sequencer is running
./run.sh -d -g localhost:9090

# Look for connection errors in logs
```

### 2. Port Already in Use
```bash
# Use different port
./run.sh -p 8081

# Or find what's using the port
lsof -i :8080
```

### 3. File Watching Not Working
```bash
# Install air
go install github.com/cosmtrek/air@latest

# Or use fswatch/inotifywait
brew install fswatch  # macOS
sudo apt-get install inotify-tools  # Linux
```

### 4. gRPC Connection Issues
```bash
# Check sequencer is running
grpcurl -plaintext localhost:9090 continuum.sequencer.v1.SequencerService/GetStatus

# Enable gRPC debug logging
GRPC_GO_LOG_VERBOSITY_LEVEL=99 GRPC_GO_LOG_SEVERITY_LEVEL=info ./proxy
```

## Code Style

### Format Code
```bash
make fmt
```

### Lint Code
```bash
make lint
```

### Pre-commit Checks
```bash
make fmt
make lint
make test
```

## Docker Development

### Build Docker Image
```bash
make docker-build
```

### Run in Docker
```bash
make docker-run
```

### Development with Docker
```bash
# Build and run with debug
docker build -t continuum-proxy-dev .
docker run -p 8080:8080 -e DEBUG=true continuum-proxy-dev
```

## Performance Monitoring

### Enable Detailed Logging
```bash
export RUST_LOG=debug
export GODEBUG=gctrace=1
./run.sh -d
```

### Monitor Memory Usage
```bash
# Watch memory usage
watch -n 1 'ps aux | grep proxy'

# Or use htop
htop -p $(pgrep proxy)
```

## Tips and Tricks

1. **Use watch mode** for rapid development: `./run.sh -w`
2. **Set up aliases** in your shell:
   ```bash
   alias proxy-dev="./run.sh --dev"
   alias proxy-debug="./run.sh -d"
   alias proxy-watch="./run.sh -w"
   ```
3. **Use environment file** for consistent settings: `source dev.env`
4. **Enable verbose logging** to understand gRPC communication
5. **Use debug headers** to troubleshoot frontend issues
6. **Monitor logs** in real-time: `./run.sh -d | grep "🔍"`