#!/usr/bin/env bun
import { TickLogger, type TickLoggerConfig } from './src/services/tick-logger.js';

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

// Mock configuration for testing (adjust based on your gRPC server)
const config: TickLoggerConfig = {
  grpcAddress: getGrpcAddress(),
  startTick: 0n,
  reconnectDelay: 3000,
  logLevel: 'detailed',
};

console.log('🧪 Testing Tick Logger Service');
console.log('==============================');
console.log('This test will attempt to connect to the gRPC server and log ticks.');
console.log('Make sure your gRPC server is running on:', config.grpcAddress);
console.log('==============================\n');

const tickLogger = new TickLogger(config);

// Test duration (30 seconds)
const testDuration = 30000;

const runTest = async () => {
  try {
    console.log('🚀 Starting tick logger test...');
    await tickLogger.start();
    
    // Let it run for the test duration
    setTimeout(async () => {
      console.log('\n⏰ Test duration reached, stopping...');
      await tickLogger.stop();
      
      const finalStatus = tickLogger.getStatus();
      console.log('\n🎉 Test Results:');
      console.log(`   Ticks Logged: ${finalStatus.tickCount}`);
      console.log(`   Transactions: ${finalStatus.transactionCount}`);
      console.log(`   Uptime: ${Math.floor(finalStatus.uptime)}s`);
      
      process.exit(0);
    }, testDuration);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n💡 Possible issues:');
    console.log('   - gRPC server is not running');
    console.log('   - Wrong gRPC address (set GRPC_ADDRESS env var)');
    console.log('   - Network connectivity issues');
    process.exit(1);
  }
};

// Handle manual shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Manual shutdown requested...');
  await tickLogger.stop();
  process.exit(0);
});

runTest();