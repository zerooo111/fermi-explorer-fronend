# Fermi Explorer Bun Backend

A high-performance Bun.js port of the Fermi Explorer Go backend, designed for rapid development and investor demonstrations.

## Features

- **Fast Development**: Built with Bun.js for extremely fast startup and execution
- **HTTP API**: RESTful endpoints for transaction and tick data
- **WebSocket Streaming**: Real-time tick streaming with throttling (24 FPS)
- **gRPC Client**: Connects to the Continuum sequencer
- **CORS Support**: Configurable cross-origin resource sharing
- **Graceful Shutdown**: Proper cleanup of connections and resources
- **Type Safety**: Full TypeScript implementation

## Quick Start

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Copy environment configuration**:
   ```bash
   cp .env.example .env
   ```

3. **Start the development server**:
   ```bash
   bun run dev
   ```

4. **Or start in production mode**:
   ```bash
   bun run start
   ```

## Configuration

Configure the server using environment variables:

### Server Configuration
- `HTTP_PORT`: HTTP server port (default: 3001)
- `DEBUG`: Enable debug logging (default: false)

### Sequencer Configuration
Option 1 - Single IP:
- `CONTINUUM_IP`: Single IP address for both gRPC and REST

Option 2 - Individual URLs:
- `CONTINUUM_SEQUENCER_URL`: gRPC server address (default: localhost:9090)
- `CONTINUUM_REST_URL`: REST API base URL (default: http://localhost:8080/api/v1)

### CORS Configuration
- `CORS_ALLOWED_ORIGINS`: Comma-separated list of allowed origins
- `CORS_ALLOW_CREDENTIALS`: Allow credentials in CORS requests

### WebSocket Configuration
- `WEBSOCKET_THROTTLE_FPS`: Frame rate for WebSocket updates (default: 24)

## API Endpoints

### Health & Status
- `GET /api/v1/health` - Health check
- `GET /api/v1/status` - Sequencer status

### Transactions
- `GET /api/v1/tx/{hash}` - Get transaction by hash
- `POST /api/v1/tx` - Submit new transaction

### Ticks
- `GET /api/v1/tick/{number}` - Get tick by number
- `GET /api/v1/ticks/recent` - Get recent ticks (with pagination)

### WebSocket
- `ws://localhost:3001/ws/ticks` - Real-time tick streaming
  - Query parameter: `start_tick` - Start streaming from specific tick

## Project Structure

```
src/
├── config/          # Environment configuration
├── grpc/            # gRPC client implementation
├── handlers/        # HTTP request handlers
├── middleware/      # Request validation and middleware
├── websocket/       # WebSocket streaming functionality
└── main.ts          # Server entry point
```

## Development

- **Watch mode**: `bun run dev` (auto-restarts on file changes)
- **Build**: `bun run build`
- **Lint**: `bun run lint`
- **Test**: `bun run test`

## Comparison with Go Backend

| Feature | Go Backend | Bun Backend |
|---------|------------|-------------|
| Language | Go | TypeScript |
| Runtime | Native | Bun.js |
| Startup Time | ~100ms | ~10ms |
| Development DX | Good | Excellent |
| Hot Reload | Manual | Built-in |
| Memory Usage | Lower | Higher |
| Performance | Higher | Good |

## Performance Notes

- Uses throttled WebSocket updates (24 FPS) for smooth UI performance
- Connection pooling for HTTP requests
- Efficient gRPC streaming with proper cleanup
- Memory-conscious client management

## Dependencies

- **Hono**: Fast web framework
- **@grpc/grpc-js**: gRPC client
- **ws**: WebSocket implementation
- **TypeScript**: Type safety

## Graceful Shutdown

The server handles graceful shutdown on SIGINT/SIGTERM:

1. Stops accepting new connections
2. Closes existing WebSocket connections
3. Shuts down gRPC client
4. Exits cleanly

Perfect for containerized deployments and development workflows.