#!/usr/bin/env bun
import { TickStreamer, type TickStreamerConfig } from './services/tick-streamer.js';

const config: TickStreamerConfig = {
  grpcAddress: process.env.SEQUENCER_GRPC_ADDRESS || 'localhost:50051',
  database: {
    host: process.env.TIMESCALE_HOST || 'localhost',
    port: parseInt(process.env.TIMESCALE_PORT || '5432'),
    database: process.env.TIMESCALE_DATABASE || 'fermi_ticks',
    user: process.env.TIMESCALE_USER || 'postgres',
    password: process.env.TIMESCALE_PASSWORD || 'password',
    ssl: process.env.TIMESCALE_SSL === 'true',
  },
  startTick: process.env.START_TICK ? BigInt(process.env.START_TICK) : 0n,
  reconnectDelay: parseInt(process.env.RECONNECT_DELAY || '5000'),
};

console.log('Starting Fermi Tick Streamer Service');
console.log('Configuration:', {
  grpcAddress: config.grpcAddress,
  database: {
    ...config.database,
    password: '***hidden***',
  },
  startTick: config.startTick.toString(),
  reconnectDelay: config.reconnectDelay,
});

const streamer = new TickStreamer(config);

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  await streamer.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  await streamer.stop();
  process.exit(0);
});

// Start the service
try {
  await streamer.start();
  console.log('Tick streamer service started successfully');
  
  // Keep the process running
  setInterval(() => {
    const status = streamer.getStatus();
    console.log(`Service status - Running: ${status.isRunning}, gRPC: ${status.grpcAddress}`);
  }, 30000); // Status log every 30 seconds
  
} catch (error) {
  console.error('Failed to start tick streamer service:', error);
  process.exit(1);
}