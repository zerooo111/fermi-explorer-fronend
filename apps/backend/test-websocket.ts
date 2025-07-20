#!/usr/bin/env bun

/**
 * WebSocket Test Script for Fermi Explorer Backend
 * 
 * This script tests the WebSocket connection to the backend server
 * and verifies that tick streaming works properly.
 */

import { WebSocket } from 'ws';

interface TestConfig {
  wsUrl: string;
  timeout: number;
  expectedMessageTypes: string[];
}

class WebSocketTester {
  private config: TestConfig;
  private ws?: WebSocket;
  private receivedMessages: any[] = [];
  private connectionEstablished = false;
  private testStartTime = Date.now();

  constructor(config: TestConfig) {
    this.config = config;
  }

  async runTest(): Promise<boolean> {
    console.log('🧪 Starting WebSocket Test');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 Connecting to: ${this.config.wsUrl}`);
    console.log(`⏱️  Timeout: ${this.config.timeout}ms`);
    console.log(`📋 Expected message types: ${this.config.expectedMessageTypes.join(', ')}`);
    console.log('');

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        this.handleTestTimeout();
        resolve(false);
      }, this.config.timeout);

      try {
        this.ws = new WebSocket(this.config.wsUrl);
        this.setupEventHandlers(timeoutId, resolve);
      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error);
        clearTimeout(timeoutId);
        resolve(false);
      }
    });
  }

  private setupEventHandlers(timeoutId: NodeJS.Timeout, resolve: (value: boolean) => void): void {
    if (!this.ws) return;

    this.ws.on('open', () => {
      this.connectionEstablished = true;
      const elapsed = Date.now() - this.testStartTime;
      console.log(`✅ Connection established (${elapsed}ms)`);
      console.log('⏳ Waiting for messages...');
    });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.receivedMessages.push(message);
        
        const elapsed = Date.now() - this.testStartTime;
        console.log(`📨 Message received (${elapsed}ms):`, {
          type: message.type,
          tick_number: message.tick_number,
          transaction_count: message.transaction_count
        });

        // Check if we've received all expected message types
        const receivedTypes = new Set(this.receivedMessages.map(m => m.type));
        const hasAllExpectedTypes = this.config.expectedMessageTypes.every(type => 
          receivedTypes.has(type)
        );

        if (hasAllExpectedTypes && this.receivedMessages.length >= 3) {
          console.log('✅ Test completed successfully!');
          this.printTestResults();
          clearTimeout(timeoutId);
          this.closeConnection();
          resolve(true);
        }
      } catch (error) {
        console.error('❌ Failed to parse message:', error);
        console.log('📝 Raw message:', data.toString());
      }
    });

    this.ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      clearTimeout(timeoutId);
      resolve(false);
    });

    this.ws.on('close', (code, reason) => {
      const elapsed = Date.now() - this.testStartTime;
      console.log(`🔌 Connection closed (${elapsed}ms): Code ${code}, Reason: ${reason}`);
      
      if (!this.connectionEstablished) {
        console.error('❌ Connection was never established');
        clearTimeout(timeoutId);
        resolve(false);
      }
    });

    this.ws.on('ping', () => {
      console.log('🏓 Ping received from server');
    });
  }

  private handleTestTimeout(): void {
    console.log('⏰ Test timeout reached');
    
    if (!this.connectionEstablished) {
      console.error('❌ Failed to establish WebSocket connection');
      console.log('🔍 Possible issues:');
      console.log('   - Server is not running');
      console.log('   - WebSocket endpoint not configured');
      console.log('   - Network connectivity issues');
      console.log('   - CORS/Origin restrictions');
    } else if (this.receivedMessages.length === 0) {
      console.error('❌ Connection established but no messages received');
      console.log('🔍 Possible issues:');
      console.log('   - gRPC client not connected to sequencer');
      console.log('   - Tick streaming not working');
      console.log('   - Server-side errors');
    } else {
      console.warn('⚠️  Partial success - received some messages but test incomplete');
      this.printTestResults();
    }
    
    this.closeConnection();
  }

  private printTestResults(): void {
    console.log('');
    console.log('📊 Test Results Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✉️  Total messages received: ${this.receivedMessages.length}`);
    
    const messageTypes = new Set(this.receivedMessages.map(m => m.type));
    console.log(`📋 Message types received: ${Array.from(messageTypes).join(', ')}`);
    
    const expectedTypes = new Set(this.config.expectedMessageTypes);
    const missingTypes = Array.from(expectedTypes).filter(type => !messageTypes.has(type));
    
    if (missingTypes.length > 0) {
      console.log(`❌ Missing message types: ${missingTypes.join(', ')}`);
    } else {
      console.log('✅ All expected message types received');
    }

    // Show sample messages
    if (this.receivedMessages.length > 0) {
      console.log('');
      console.log('📝 Sample Messages:');
      this.receivedMessages.slice(0, 2).forEach((msg, index) => {
        console.log(`   ${index + 1}. Type: ${msg.type}`);
        if (msg.tick_number) console.log(`      Tick: ${msg.tick_number}`);
        if (msg.transaction_count !== undefined) console.log(`      Transactions: ${msg.transaction_count}`);
        if (msg.error) console.log(`      Error: ${msg.error}`);
      });
    }
  }

  private closeConnection(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
  }
}

// Test configuration
const config: TestConfig = {
  wsUrl: 'ws://localhost:3001/ws/ticks',
  timeout: 15000, // 15 seconds
  expectedMessageTypes: ['tick']
};

// Alternative test with start_tick parameter
const configWithStartTick: TestConfig = {
  wsUrl: 'ws://localhost:3001/ws/ticks?start_tick=1',
  timeout: 15000,
  expectedMessageTypes: ['tick']
};

async function runTests(): Promise<void> {
  console.log('🔬 WebSocket Test Suite for Fermi Explorer Backend');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  // Test 1: Basic WebSocket connection
  console.log('🧪 Test 1: Basic WebSocket Connection');
  const tester1 = new WebSocketTester(config);
  const result1 = await tester1.runTest();
  
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  // Test 2: WebSocket with start_tick parameter
  console.log('🧪 Test 2: WebSocket with start_tick Parameter');
  const tester2 = new WebSocketTester(configWithStartTick);
  const result2 = await tester2.runTest();

  console.log('');
  console.log('🏁 Final Results');
  console.log('═══════════════════════════════════════════════════');
  console.log(`Test 1 (Basic): ${result1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Test 2 (Start Tick): ${result2 ? '✅ PASS' : '❌ FAIL'}`);
  
  const overallResult = result1 || result2;
  console.log(`Overall: ${overallResult ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!overallResult) {
    console.log('');
    console.log('🔧 Troubleshooting Steps:');
    console.log('1. Check if the backend server is running on port 3001');
    console.log('2. Verify WebSocket endpoint is configured in the server');
    console.log('3. Check server logs for any errors');
    console.log('4. Ensure gRPC client is connected to the sequencer');
    console.log('5. Test REST API endpoints first: curl http://localhost:3001/api/v1/health');
  }

  process.exit(overallResult ? 0 : 1);
}

// Run the tests
runTests().catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});