# Fermi Explorer Monorepo

A comprehensive blockchain data explorer for the Continuum Sequencer network, featuring real-time data streaming and an intuitive web interface.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Fermi Explorer System                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Frontend (React + TanStack)  │  Backend (Go Proxy)  │  Continuum Sequencer │
│                               │                      │                      │
│  • TanStack Router           │  • gRPC to REST      │  • gRPC API (9090)   │
│  • TanStack Query            │  • WebSocket Stream  │  • REST API (8080)   │
│  • Real-time Updates         │  • CORS Support      │  • Blockchain Data   │
│  • Tailwind CSS              │  • Health Checks     │  • Transaction Pool  │
│                               │                      │                      │
│  Port: 3000 (dev)            │  Port: 3001          │  Ports: 8080, 9090   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
fermi-explorer-monorepo/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services and data providers
│   │   └── routes/        # TanStack Router routes
│   ├── README.md         # Frontend-specific documentation
│   └── package.json      # Frontend dependencies
│
├── backend/              # Go backend proxy service
│   ├── cmd/proxy/        # Main application entry point
│   ├── internal/         # Internal packages
│   │   ├── grpc/         # gRPC client wrapper
│   │   ├── handlers/     # HTTP request handlers
│   │   └── websocket/    # WebSocket streaming handlers
│   ├── proto/            # Protocol buffer definitions
│   ├── README.md         # Backend-specific documentation
│   ├── DEVELOPMENT.md    # Development guide
│   └── go.mod            # Go module dependencies
│
└── README.md             # This file
```

## Features

### Frontend Features
- **Real-time Blockchain Data**: Live streaming of tick data via WebSocket
- **Type-safe API Integration**: Comprehensive TypeScript support with TanStack Query
- **Intelligent Caching**: Optimized data fetching with automatic cache invalidation
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Advanced Routing**: File-based and code-based routing options with TanStack Router
- **Performance Optimized**: Prefetching, pagination, and memory management

### Backend Features
- **Hybrid API Approach**: REST endpoints + gRPC streaming for optimal performance
- **WebSocket Streaming**: Real-time tick streaming for frontend consumption
- **CORS Support**: Configured for seamless frontend integration
- **Health Monitoring**: Built-in health checks and status endpoints
- **Connection Management**: Efficient connection pooling and error handling

## Quick Start

### Prerequisites
- **Frontend**: Node.js 18+ and Bun
- **Backend**: Go 1.21+
- **Sequencer**: Continuum Sequencer running on ports 8080 (REST) and 9090 (gRPC)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd fermi-explorer-monorepo
```

### 2. Quick Start (Recommended)

Use the unified startup script to run both services together:

```bash
./start.sh
```

This will:
- Start the backend on port 3001
- Start the frontend on port 3000
- Set up proper environment variables
- Monitor both services
- Provide health checks and logging

### 3. Manual Setup (Alternative)

#### Backend Setup
```bash
cd backend
go mod download
go build -o proxy ./cmd/proxy
./proxy
```

#### Frontend Setup
```bash
cd frontend
bun install
bun run start
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **WebSocket**: ws://localhost:3001/ws/ticks

## Unified Startup Script

The `start.sh` script provides a comprehensive way to manage both services:

### Basic Usage
```bash
./start.sh                    # Start both services
./start.sh --help             # Show help and options
./start.sh --check            # Check service status
./start.sh --stop             # Stop all services
```

### Advanced Options
```bash
./start.sh --debug            # Enable debug logging
./start.sh --backend-only     # Start only backend
./start.sh --frontend-only    # Start only frontend
./start.sh --backend-port 3002 # Custom backend port
./start.sh --frontend-port 3001 # Custom frontend port
```

### Environment Variables
```bash
# Backend configuration
export BACKEND_PORT=3001
export CONTINUUM_REST_URL=http://localhost:8080/api/v1
export CONTINUUM_SEQUENCER_URL=localhost:9090

# Frontend configuration  
export FRONTEND_PORT=3000
export DEBUG=true

# Then start
./start.sh
```

### Service Management
- **Logs**: Check `logs/backend.log` and `logs/frontend.log`
- **Process IDs**: Stored in `/tmp/fermi-backend.pid` and `/tmp/fermi-frontend.pid`
- **Health Checks**: Automatic service monitoring and restart on failure
- **Cleanup**: Proper process cleanup on exit (Ctrl+C)

## Development

### Backend Development

```bash
cd backend

# Basic development run
./run.sh

# Debug mode with detailed logging
./run.sh -d

# Watch mode (auto-restart on changes)
./run.sh -w

# Development mode with all features
./run.sh --dev
```

### Frontend Development

```bash
cd frontend

# Start development server
bun run start

# Run tests
bun run test

# Build for production
bun run build

# Lint and format
bun run lint
bun run format
```

## API Endpoints

### Backend REST API

All endpoints are prefixed with `/api/v1`:

- `GET /health` - Health check
- `GET /status` - Sequencer status
- `GET /tx/{hash}` - Get transaction by hash
- `POST /tx` - Submit transaction
- `GET /tick/{number}` - Get tick by number
- `GET /ticks/recent` - Get recent ticks with pagination

### WebSocket Streaming

- `WS /ws/ticks` - Stream live ticks
- `WS /ws/ticks?start_tick=1000` - Stream from specific tick

## Configuration

### Backend Configuration

Environment variables:
```bash
CONTINUUM_SEQUENCER_URL=localhost:9090    # gRPC address
CONTINUUM_REST_URL=http://localhost:8080/api/v1  # REST API
HTTP_PORT=3001                            # Backend port
DEBUG=false                               # Debug logging
```

Command line flags:
```bash
./proxy -port 3001 -grpc localhost:9090 -debug
```

### Frontend Configuration

The frontend automatically connects to the backend at `http://localhost:3001` during development.

## Data Flow

1. **Frontend** requests data via TanStack Query hooks
2. **Backend** proxies REST requests to Continuum Sequencer
3. **WebSocket** streams real-time tick data from gRPC
4. **Frontend** receives updates and updates UI reactively

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Data fetching and caching
- **TanStack Store** - State management
- **Tailwind CSS** - Styling framework
- **TypeScript** - Type safety
- **Vitest** - Testing framework

### Backend
- **Go 1.21+** - Backend language
- **gRPC** - High-performance RPC
- **Gorilla WebSocket** - WebSocket implementation
- **Protocol Buffers** - Data serialization
- **HTTP/REST** - API endpoints

## Testing

### Backend Tests
```bash
cd backend
go test ./...
make test-coverage
```

### Frontend Tests
```bash
cd frontend
bun run test
```

## Production Deployment

### Backend
```bash
cd backend
go build -ldflags="-s -w" -o proxy ./cmd/proxy
./proxy -port 3001
```

### Frontend
```bash
cd frontend
bun run build
# Deploy dist/ directory to web server
```

## Monitoring and Debugging

### Backend Monitoring
- Health endpoint: `GET /api/v1/health`
- Status endpoint: `GET /api/v1/status`
- Debug logging: `DEBUG=true ./proxy`

### Frontend Debugging
- React Query DevTools (development mode)
- TanStack Router DevTools (development mode)
- Browser developer tools

## Common Issues

### Backend Issues
1. **Connection refused**: Verify Continuum Sequencer is running
2. **WebSocket failed**: Check CORS configuration
3. **High latency**: Verify network connectivity

### Frontend Issues
1. **API requests failing**: Check backend is running on port 3001
2. **WebSocket not connecting**: Verify backend WebSocket endpoint
3. **Build errors**: Check TypeScript configuration

## Contributing

1. Follow existing code patterns and conventions
2. Add tests for new functionality
3. Update documentation
4. Ensure proper error handling
5. Test with actual Continuum Sequencer instance

## Performance Optimization

### Backend
- Connection pooling for gRPC
- Efficient WebSocket handling
- Minimal memory footprint
- Concurrent request processing

### Frontend
- Intelligent caching strategies
- Prefetching and pagination
- Memory-efficient data structures
- Optimized bundle size

## Security

- Input validation on all endpoints
- CORS configuration for development
- No authentication currently implemented
- Rate limiting handled by Continuum Sequencer

## License

This project is part of the Continuum ecosystem and follows the same licensing terms.

---

For more detailed information, see the individual README files in the `frontend/` and `backend/` directories.