# Tick Logger Service

A lightweight, database-agnostic service that listens to the gRPC `StreamTicks` RPC and logs tick data in real-time.

## Features

- 🚀 **Database-agnostic**: No database dependencies, pure logging
- 📡 **gRPC Stream**: Connects to `StreamTicks` RPC for real-time data
- 🔄 **Auto-reconnect**: Automatic reconnection on connection failures
- 📊 **Multiple log levels**: Basic, detailed, and full logging modes
- 📈 **Statistics**: Built-in tick and transaction counting
- 🛡️ **Graceful shutdown**: Proper cleanup and final statistics

## Quick Start

1. **Run with default settings:**
   ```bash
   bun run tick-logger
   ```

2. **Run in development mode (auto-reload):**
   ```bash
   bun run tick-logger:dev
   ```

3. **Test the service:**
   ```bash
   bun run test:tick-logger
   ```

## Configuration

Configure via environment variables or copy `tick-logger.env.example` to `.env`:

```bash
# Sequencer Configuration - Option 1: Single IP (will use port 9090)
CONTINUUM_IP=localhost

# Sequencer Configuration - Option 2: Full gRPC address (overrides CONTINUUM_IP)
# SEQUENCER_GRPC_ADDRESS=localhost:9090

# Starting tick number (0 = latest)
START_TICK=0

# Reconnection delay in milliseconds
RECONNECT_DELAY=5000

# Log level: basic | detailed | full
LOG_LEVEL=detailed
```

The service follows the same configuration pattern as the backend:
- **Option 1**: Set `CONTINUUM_IP` and the service will use port `9090`
- **Option 2**: Set `SEQUENCER_GRPC_ADDRESS` to override with a full address

## Log Levels

### Basic
```
📊 Tick #123: 5 transactions
📊 Tick #124: 3 transactions
```

### Detailed (default)
```
📊 === TICK #123 ===
⏰ Timestamp: 2024-01-15T10:30:45.123Z
💼 Transactions: 5
🔗 Batch Hash: a1b2c3d4e5f6...
🔐 VDF Output: 9876543210ab...
🔹 Transaction summaries:
   1. tx_abc123... (ID: user_tx_001)
   2. tx_def456... (ID: user_tx_002)
   ... and 3 more transactions
```

### Full
Complete tick and transaction details including:
- Full VDF proof data
- Complete transaction information
- Timestamps and signatures
- Payload sizes

## Architecture

The service is built with these key components:

- **TickLogger**: Main service class that manages the gRPC stream
- **GrpcClient**: Handles gRPC communication and reconnection logic
- **Configuration**: Flexible environment-based configuration

## Usage in Your Application

```typescript
import { TickLogger, type TickLoggerConfig } from './services/tick-logger.js';

const config: TickLoggerConfig = {
  grpcAddress: 'your-grpc-server:50051',
  startTick: 0n,
  logLevel: 'detailed',
};

const logger = new TickLogger(config);
await logger.start();

// Later...
await logger.stop();
```

## Phase 2: Database Integration

This service is designed to be easily extended with database functionality. The planned TimescaleDB integration will:

1. Maintain the same logging interface
2. Add database configuration options
3. Store ticks and transactions in TimescaleDB
4. Provide querying capabilities
5. Support time-series analytics

## Development

- **Main service**: `src/services/tick-logger.ts`
- **Standalone runner**: `src/tick-logger-main.ts`
- **Test script**: `test-tick-logger.ts`

The service uses the existing gRPC client infrastructure and protobuf definitions.