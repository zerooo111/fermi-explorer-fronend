# Fermi Explorer Monorepo

A comprehensive blockchain data explorer for the Continuum Sequencer network, featuring real-time data streaming and an intuitive web interface. Built as a Bun workspace monorepo with shared packages and unified development experience.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Fermi Explorer System                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  Frontend (React + TanStack)  │  Backend (Bun + TS)  │  Continuum Sequencer │
│                               │                      │                      │
│  • TanStack Router           │  • gRPC to REST      │  • gRPC API (9090)   │
│  • TanStack Query            │  • WebSocket Stream  │  • REST API (8080)   │
│  • Real-time Updates         │  • CORS Support      │  • Blockchain Data   │
│  • Tailwind CSS              │  • Health Checks     │  • Transaction Pool  │
│  • @fermi/* packages         │  • TypeScript        │                      │
│                               │                      │                      │
│  Port: 3000 (dev)            │  Port: 3001          │  Ports: 8080, 9090   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
fermi-explorer-monorepo/
├── apps/                     # Applications
│   ├── frontend/            # React frontend application
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── pages/       # Route pages
│   │   │   └── api/         # API client
│   │   └── package.json     # Frontend dependencies
│   │
│   └── backend/             # Bun/TypeScript backend service
│       ├── src/
│       │   ├── grpc/        # gRPC client wrapper
│       │   ├── handlers/    # HTTP request handlers
│       │   ├── middleware/  # Request middleware
│       │   └── websocket/   # WebSocket streaming
│       ├── README.md        # Backend documentation
│       └── package.json     # Backend dependencies
│
├── packages/                # Shared packages
│   ├── shared-types/        # TypeScript type definitions
│   ├── shared-utils/        # Utility functions
│   └── config/              # Environment configuration
│
├── package.json             # Workspace configuration
├── bun.lock                 # Dependency lockfile
├── start.sh                 # Unified startup script
└── README.md                # This file
```

## Features

### Monorepo Benefits
- **Shared Packages**: Centralized types, utilities, and configuration
- **Unified Build System**: Single command to build all packages
- **Type Safety**: Shared TypeScript definitions across frontend and backend
- **Code Reuse**: Validation, formatting, and utility functions shared
- **Workspace Management**: Bun workspace for efficient dependency management

### Frontend Features
- **Real-time Blockchain Data**: Live streaming of tick data via WebSocket
- **Type-safe API Integration**: Uses @fermi/shared-types for consistent APIs
- **Intelligent Caching**: Optimized data fetching with automatic cache invalidation
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Advanced Routing**: File-based and code-based routing options with TanStack Router
- **Performance Optimized**: Prefetching, pagination, and memory management

### Backend Features
- **TypeScript Backend**: Fast Bun runtime with full type safety
- **Hybrid API Approach**: REST endpoints + gRPC streaming for optimal performance
- **WebSocket Streaming**: Real-time tick streaming for frontend consumption
- **Shared Validation**: Uses @fermi/shared-utils for consistent validation
- **Health Monitoring**: Built-in health checks and status endpoints
- **Connection Management**: Efficient connection pooling and error handling

## Quick Start

### Prerequisites
- **Bun**: Latest version for package management and runtime
- **Node.js**: 18+ for frontend development
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
- Install dependencies for all workspace packages
- Build shared packages (@fermi/*)
- Start the backend on port 3001
- Start the frontend on port 3000
- Set up proper environment variables
- Monitor both services
- Provide health checks and logging

### 3. Manual Setup (Alternative)

#### Install Dependencies
```bash
bun install
```

#### Build Shared Packages
```bash
bun run build
```

#### Start Development
```bash
# Start both frontend and backend
bun run dev

# Or start individually
bun run --filter '@fermi/backend' dev
bun run --filter '@fermi/frontend' dev
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

### Workspace Commands

```bash
# Install all dependencies
bun install

# Build all packages
bun run build

# Start development mode (both apps)
bun run dev

# Run tests across workspace
bun run test

# Lint all packages
bun run lint

# TypeScript check all packages
bun run typecheck
```

### Individual Package Development

```bash
# Backend development
bun run --filter '@fermi/backend' dev
bun run --filter '@fermi/backend' build
bun run --filter '@fermi/backend' test

# Frontend development
bun run --filter '@fermi/frontend' dev
bun run --filter '@fermi/frontend' build
bun run --filter '@fermi/frontend' test

# Shared package development
bun run --filter '@fermi/shared-*' build
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

### Monorepo
- **Bun Workspaces** - Package management and workspace orchestration
- **TypeScript** - Shared type safety across all packages
- **@fermi/shared-types** - Centralized API and validation types
- **@fermi/shared-utils** - Shared utility functions and validation
- **@fermi/config** - Environment configuration management

### Frontend
- **React 18** - UI framework
- **TanStack Router** - Type-safe routing
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Styling framework
- **Vite** - Build tool and dev server
- **Vitest** - Testing framework

### Backend
- **Bun** - Fast TypeScript runtime
- **Hono** - Lightweight web framework
- **gRPC** - High-performance RPC communication
- **WebSocket** - Real-time streaming
- **Protocol Buffers** - Data serialization

## Testing

### Workspace Testing
```bash
# Run all tests
bun run test

# Test specific packages
bun run --filter '@fermi/backend' test
bun run --filter '@fermi/frontend' test
bun run --filter '@fermi/shared-*' test
```

### Type Checking
```bash
# Check all packages
bun run typecheck

# Check specific packages
bun run --filter '@fermi/backend' typecheck
bun run --filter '@fermi/frontend' typecheck
```

## Production Deployment

### Build for Production
```bash
# Build all packages
bun run build
```

### Backend Deployment
```bash
# Backend build output is in apps/backend/dist/
cd apps/backend
bun run start
```

### Frontend Deployment
```bash
# Frontend build output is in apps/frontend/dist/
# Deploy dist/ directory to web server or CDN
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

For more detailed information, see the individual README files in the `apps/frontend/` and `apps/backend/` directories.