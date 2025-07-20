# Technology Stack & Build System

## Frontend Stack

- **React 19** - UI framework with latest features
- **TypeScript** - Type safety and developer experience
- **TanStack Router** - Type-safe file-based routing
- **TanStack Query** - Data fetching, caching, and synchronization
- **Tailwind CSS 4** - Utility-first styling framework
- **Vite** - Fast build tool and dev server
- **Bun** - Package manager and runtime (preferred over npm/yarn)
- **Vitest** - Testing framework

### UI Components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Number Flow** - Animated number transitions
- **Class Variance Authority** - Component variant management

## Backend Stack

- **Go 1.23+** - Backend language
- **gRPC** - High-performance RPC communication
- **Protocol Buffers** - Data serialization
- **Gorilla WebSocket** - WebSocket implementation
- **Gorilla Mux** - HTTP routing
- **CORS** - Cross-origin resource sharing

## Build & Development Commands

### Frontend Commands
```bash
cd frontend

# Development
bun install          # Install dependencies
bun run start        # Start dev server (port 3000)
bun run dev          # Alternative dev command

# Build & Test
bun run build        # Production build
bun run test         # Run tests
bun run lint         # Lint code
bun run format       # Format code
bun run check        # Lint + format
```

### Backend Commands
```bash
cd bun-backend

# Development
make run             # Build and run
make dev             # Development mode with debug
make debug           # Debug mode with verbose logging
make watch           # Auto-restart on changes (requires air)

# Build
make build           # Production build
make build-debug     # Debug build with symbols

# Testing
make test            # Run tests
make test-coverage   # Tests with coverage

# Tools
make install-tools   # Install development tools
make fmt             # Format code
make lint            # Run linter
make deps            # Update dependencies
```

### Unified Startup
```bash
# Root directory - starts both services
./start.sh                    # Start both frontend and backend
./start.sh --help             # Show options
./start.sh --debug            # Debug mode
./start.sh --backend-only     # Backend only
./start.sh --frontend-only    # Frontend only
```

## Development Tools

### Required
- **Go 1.23+** - Backend runtime
- **Bun** - Frontend package manager
- **Node.js 18+** - Frontend runtime

### Optional Development Tools
- **air** - Go hot reload (`go install github.com/cosmtrek/air@latest`)
- **golangci-lint** - Go linter
- **fswatch/inotifywait** - File watching utilities

## Environment Configuration

### Backend Environment Variables
```bash
CONTINUUM_SEQUENCER_URL=localhost:9090    # gRPC address
CONTINUUM_REST_URL=http://localhost:8080/api/v1  # REST API
HTTP_PORT=3001                            # Backend port
DEBUG=true                                # Debug logging
GO_ENV=development                        # Environment
```

### Frontend Environment Variables
```bash
FRONTEND_PORT=3000                        # Dev server port
VITE_API_BASE_URL=http://localhost:3001   # Backend URL
```

## Port Configuration

- **Frontend Dev**: 3000 (Vite dev server)
- **Backend**: 3001 (Go proxy server)
- **Sequencer gRPC**: 9090 (Continuum Sequencer)
- **Sequencer REST**: 8080 (Continuum Sequencer)

## Build Outputs

- **Frontend**: `frontend/dist/` - Static files for deployment
- **Backend**: `bun-backend/` - Bun/TypeScript runtime