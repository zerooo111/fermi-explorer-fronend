#!/usr/bin/env bun
import { TickLogger, type TickLoggerConfig } from './services/tick-logger.js';

// Build gRPC address following the same pattern as backend
const getGrpcAddress = (): string => {
  // Option 2: Full address override
  if (process.env.SEQUENCER_GRPC_ADDRESS) {
    return process.env.SEQUENCER_GRPC_ADDRESS;
  }
  
  // Option 1: Use CONTINUUM_IP with port 9090
  const ip = process.env.CONTINUUM_IP || 'localhost';
  return `${ip}:9090`;
};

// Configuration
const config: TickLoggerConfig = {
  grpcAddress: getGrpcAddress(),
  startTick: process.env.START_TICK ? BigInt(process.env.START_TICK) : 0n,
  reconnectDelay: parseInt(process.env.RECONNECT_DELAY || '5000'),
  logLevel: (process.env.LOG_LEVEL as 'basic' | 'detailed' | 'full') || 'detailed',
};

console.log('🎯 Fermi Tick Logger');
console.log('==================');
console.log(`gRPC Address: ${config.grpcAddress}`);
console.log(`Start Tick: ${config.startTick}`);
console.log(`Log Level: ${config.logLevel}`);
console.log(`Reconnect Delay: ${config.reconnectDelay}ms`);
console.log('==================\n');

// Create and start the tick logger
const tickLogger = new TickLogger(config);

// Handle graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`\n📡 Received ${signal}. Shutting down gracefully...`);
  await tickLogger.stop();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start the service
try {
  await tickLogger.start();
  
  // Keep the process alive and show periodic stats
  setInterval(() => {
    const status = tickLogger.getStatus();
    if (status.isRunning) {
      console.log(`📈 Status: ${status.tickCount} ticks, ${status.transactionCount} transactions, ${Math.floor(status.uptime)}s uptime`);
    }
  }, 30000); // Every 30 seconds

} catch (error) {
  console.error('❌ Failed to start tick logger:', error);
  process.exit(1);
}