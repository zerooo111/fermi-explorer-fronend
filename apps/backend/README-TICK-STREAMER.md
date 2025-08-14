# Fermi Tick Streamer Service

A service that streams ticks from the Fermi sequencer gRPC endpoint and stores them in TimescaleDB for time-series analysis.

## Features

- Streams live ticks from the sequencer gRPC `StreamTicks` endpoint
- Stores tick data and transaction details in TimescaleDB
- Automatic reconnection on connection failures
- Detailed logging of incoming ticks and transactions
- Time-series optimized schema with hypertables and compression
- Continuous aggregates for performance analytics

## Setup

### 1. TimescaleDB Setup

```bash
# Create database
createdb fermi_ticks

# Connect to database and enable TimescaleDB
psql fermi_ticks
CREATE EXTENSION IF NOT EXISTS timescaledb;
\q

# Run the schema
psql fermi_ticks < src/database/schema.sql
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# Sequencer gRPC endpoint
SEQUENCER_GRPC_ADDRESS=localhost:50051

# TimescaleDB connection
TIMESCALE_HOST=localhost
TIMESCALE_PORT=5432
TIMESCALE_DATABASE=fermi_ticks
TIMESCALE_USER=postgres
TIMESCALE_PASSWORD=your_password

# Optional: Start from specific tick (default: 0)
START_TICK=0

# Optional: Reconnection delay in ms (default: 5000)
RECONNECT_DELAY=5000
```

## Running the Service

### Development Mode (with hot reload)
```bash
bun run tick-streamer:dev
```

### Production Mode
```bash
bun run tick-streamer
```

## Database Schema

### Tables

- **`ticks`** - Main hypertable storing tick data (partitioned by timestamp)
- **`transactions`** - Transaction details with references to ticks

### Views

- **`ticks_hourly`** - Continuous aggregate with hourly tick statistics
- **`transactions_daily`** - Daily transaction statistics

### Indexes

- Optimized for common queries by tick number, timestamp, and transaction hash
- Performance indexes for time-series queries

## Service Features

### Logging

The service provides detailed logging including:
- Service startup and connection status
- Each tick processed with transaction count
- Individual transaction details (hash, ID, nonce)
- Error handling and reconnection attempts
- Periodic status updates

### Resilience

- Automatic reconnection on gRPC stream failures
- Database transaction rollbacks on errors
- Graceful shutdown handling (SIGINT/SIGTERM)
- Connection pooling for database efficiency

### Monitoring

The service logs status every 30 seconds and provides:
- Running status
- gRPC connection status
- Database connection health

## Example Output

```
Starting Fermi Tick Streamer Service
Configuration: {
  grpcAddress: 'localhost:50051',
  database: { host: 'localhost', port: 5432, database: 'fermi_ticks', ... },
  startTick: '0',
  reconnectDelay: 5000
}
Database connection test successful: { now: '2024-01-15T10:30:00.000Z' }
Starting gRPC stream from tick 0
Processing tick 1234 with 5 transactions
  Transaction a1b2c3d4... - ID: tx_001 - Nonce: 1
  Transaction e5f6g7h8... - ID: tx_002 - Nonce: 2
Successfully saved tick 1234 to database
```

## Deployment

For production deployment, consider:
- Using environment variables for sensitive configuration
- Setting up proper logging aggregation
- Monitoring database performance
- Setting up alerts for service failures
- Using process managers like systemd or PM2