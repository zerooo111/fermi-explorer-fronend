import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import os from "os";
import { resolve, dirname } from "path";
import { mkdirSync } from "fs";
import { TickDb } from "./sqlite";
import { GrpcClient, Tick } from "../grpc/client";

// Build gRPC address following the same pattern as tick-logger
const getGrpcAddress = (): string => {
  // Option 1: Full address override
  if (process.env.GRPC_ADDR || process.env.SEQUENCER_GRPC_ADDRESS) {
    return process.env.GRPC_ADDR || process.env.SEQUENCER_GRPC_ADDRESS!;
  }

  // Option 2: Use CONTINUUM_IP with port 9090
  const ip = process.env.CONTINUUM_IP || "localhost";
  return `${ip}:9090`;
};

// Config
const GRPC_ADDR = getGrpcAddress();
const SQLITE_PATH =
  process.env.SQLITE_PATH || resolve(process.cwd(), "./data/ticks.db");
const START_TICK_ENV = process.env.START_TICK;
const START_TICK = START_TICK_ENV ? BigInt(START_TICK_ENV) : 0n;

// Batching thresholds
const TX_MAX = Number(process.env.TX_MAX || 1000);
const TICK_MAX = Number(process.env.TICK_MAX || 100);
const FLUSH_MS = Number(process.env.FLUSH_MS || 50);
const QUEUE_HIGH_WATER = Number(process.env.QUEUE_HIGH_WATER || 50000);

// Decoding options
const DECODED_CACHE = process.env.DECODED_CACHE === "1";
const WORKERS = Math.max(1, Math.min(os.cpus().length - 1, 4));

// Simple bounded queue
type TxRow = {
  tx_hash: string;
  tick_number: number;
  sequence_number: number;
  tx_id: string;
  payload: Uint8Array | null;
  signature: Uint8Array;
  public_key: Uint8Array;
  nonce: number;
  tx_timestamp: number; // microseconds or ms; we keep numeric
  ingestion_timestamp: number;
};

type TickRow = {
  tick_number: number;
  timestamp: number;
  vdf_input: string;
  vdf_output: string;
  vdf_proof: string;
  vdf_iterations: number;
  transaction_batch_hash: string;
  previous_output: string;
};

const ticksQueue: TickRow[] = [];
const txQueue: TxRow[] = [];

let paused = false;
let flushTimer: Timer | undefined;
let streamCleanup: (() => void) | undefined;
let shutdownRequested = false;

// Ensure directory exists
try {
  mkdirSync(dirname(SQLITE_PATH), { recursive: true });
} catch {}
const db = new TickDb({ path: SQLITE_PATH });

function toInt(str: string): number {
  // Safe for large but within JS max safe int; OK for MVP
  return Number(str);
}

function enqueueTick(t: Tick) {
  // Check if we're shutting down
  if (shutdownRequested) return;

  // Apply backpressure if queues are too large
  if (ticksQueue.length > QUEUE_HIGH_WATER || txQueue.length > QUEUE_HIGH_WATER) {
    if (!paused) {
      console.warn(`🚦 Queue high water mark reached (ticks: ${ticksQueue.length}, txs: ${txQueue.length}), applying backpressure`);
      paused = true;
    }
    return;
  }

  const txs = t.transactions || [];
  if (txs.length === 0) {
    // Skip ticks with no transactions - these are empty blocks
    return;
  }

  console.log(`📥 Processing tick ${t.tick_number} with ${txs.length} transactions`);

  const tick_number = toInt(t.tick_number);
  const timestamp = toInt(t.timestamp); // assume microseconds; store as integer
  const vdf_iterations = toInt(t.vdf_proof.iterations);

  ticksQueue.push({
    tick_number,
    timestamp,
    vdf_input: t.vdf_proof.input,
    vdf_output: t.vdf_proof.output,
    vdf_proof: t.vdf_proof.proof,
    vdf_iterations,
    transaction_batch_hash: t.transaction_batch_hash,
    previous_output: t.previous_output,
  });

  for (const otx of txs) {
    const tr = otx.transaction;
    txQueue.push({
      tx_hash: otx.tx_hash,
      tick_number,
      sequence_number: toInt(otx.sequence_number),
      tx_id: tr.tx_id,
      payload: tr.payload ?? null,
      signature: tr.signature,
      public_key: tr.public_key,
      nonce: Number(tr.nonce),
      tx_timestamp: Number(tr.timestamp),
      ingestion_timestamp: toInt(otx.ingestion_timestamp),
    });
  }

  // Dispatch decode jobs if enabled
  if (txs.length > 0) {
    const txRows = txs.map((otx) => ({
      tx_hash: otx.tx_hash,
      tick_number,
      sequence_number: toInt(otx.sequence_number),
      tx_id: otx.transaction.tx_id,
      payload: otx.transaction.payload ?? null,
      signature: otx.transaction.signature,
      public_key: otx.transaction.public_key,
      nonce: Number(otx.transaction.nonce),
      tx_timestamp: Number(otx.transaction.timestamp),
      ingestion_timestamp: toInt(otx.ingestion_timestamp),
    }));
    dispatchDecodeJobs(txRows);
  }
}

async function flushBatch() {
  if (ticksQueue.length === 0 && txQueue.length === 0) return;
  const start = Date.now();
  const takeTicks = Math.min(ticksQueue.length, TICK_MAX);
  const takeTx = Math.min(txQueue.length, TX_MAX);

  const ticks = ticksQueue.splice(0, takeTicks);
  const txs = txQueue.splice(0, takeTx);

  console.log(`Flushing batch: ${ticks.length} ticks, ${txs.length} transactions`);

  let ticksSaved = 0;
  let txsSaved = 0;
  let ticksSkipped = 0;
  let txsSkipped = 0;

  try {
    db.begin();
    
    // Insert ticks
    for (const t of ticks) {
      try {
        const result = db.insertTick.run(
          t.tick_number,
          t.timestamp,
          t.vdf_input,
          t.vdf_output,
          t.vdf_proof,
          t.vdf_iterations,
          t.transaction_batch_hash,
          t.previous_output
        );
        if (result.changes > 0) {
          ticksSaved++;
          console.log(`✓ Saved tick ${t.tick_number}`);
        } else {
          ticksSkipped++;
          console.log(`⚠ Skipped tick ${t.tick_number} (already exists)`);
        }
      } catch (e) {
        console.error(`✗ Failed to save tick ${t.tick_number}:`, e);
        throw e;
      }
    }
    
    // Insert transactions
    for (const x of txs) {
      try {
        const result = db.insertTx.run(
          x.tx_hash,
          x.tick_number,
          x.sequence_number,
          x.tx_id,
          x.payload ? Buffer.from(x.payload) : null,
          Buffer.from(x.signature),
          Buffer.from(x.public_key),
          x.nonce,
          x.tx_timestamp,
          x.ingestion_timestamp
        );
        if (result.changes > 0) {
          txsSaved++;
        } else {
          txsSkipped++;
        }
      } catch (e) {
        console.error(`✗ Failed to save transaction ${x.tx_hash} for tick ${x.tick_number}:`, e);
        throw e;
      }
    }
    
    // Update last committed tick if any
    const maxTick = ticks.reduce((m, t) => Math.max(m, t.tick_number), 0);
    if (maxTick > 0) {
      try {
        db.upsertState.run(maxTick);
        console.log(`✓ Updated last committed tick to ${maxTick}`);
      } catch (e) {
        console.error(`✗ Failed to update state for tick ${maxTick}:`, e);
        throw e;
      }
    }
    
    db.commit();
    
    console.log(`✅ Batch committed successfully: ${ticksSaved} ticks saved, ${txsSaved} transactions saved (${ticksSkipped} ticks, ${txsSkipped} txs skipped as duplicates)`);

    // Check if we can resume from backpressure
    const lowWaterMark = QUEUE_HIGH_WATER * 0.5;
    if (paused && ticksQueue.length < lowWaterMark && txQueue.length < lowWaterMark) {
      console.log(`🔄 Resuming stream processing (ticks: ${ticksQueue.length}, txs: ${txQueue.length})`);
      paused = false;
    }
  } catch (e) {
    console.error(`❌ Flush failed, rolling back batch of ${ticks.length} ticks / ${txs.length} transactions:`, e);
    try {
      db.rollback();
      console.log("🔙 Rollback successful");
    } catch (rollbackError) {
      console.error("💥 Rollback failed:", rollbackError);
    }
    // On failure, requeue at head for retry (simple strategy)
    ticksQueue.unshift(...ticks);
    txQueue.unshift(...txs);
    console.log(`♻️ Requeued ${ticks.length} ticks and ${txs.length} transactions for retry`);
  } finally {
    const dur = Date.now() - start;
    if (dur > 500) {
      console.warn(`⏱️ Slow flush ${dur}ms for ${ticks.length} ticks / ${txs.length} tx`);
    } else {
      console.log(`⚡ Flush completed in ${dur}ms`);
    }
  }
}

function scheduleFlush() {
  if (flushTimer || shutdownRequested) return;
  flushTimer = setTimeout(async () => {
    flushTimer = undefined;
    await flushBatch();
    if (!shutdownRequested) {
      scheduleFlush();
    }
  }, FLUSH_MS) as unknown as Timer;
}

class StreamManager {
  private client: GrpcClient;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private startTick: bigint;
  private isConnected = false;
  
  constructor(client: GrpcClient, startTick: bigint) {
    this.client = client;
    this.startTick = startTick;
  }

  async start(): Promise<void> {
    if (shutdownRequested) return;
    
    try {
      console.log(`🚀 Starting stream from tick ${this.startTick}`);
      streamCleanup = this.client.streamTicks(
        this.startTick,
        (tick) => {
          if (!paused) {
            enqueueTick(tick);
            scheduleFlush();
          } else {
            console.log(`⏸️ Paused - dropping tick ${tick.tick_number} due to backpressure`);
          }
        },
        (error) => {
          console.error("🔌 Stream error:", error);
          this.isConnected = false;
          this.handleReconnection(error);
        }
      );
      
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log("✅ Stream connected successfully");
    } catch (error) {
      console.error("Failed to start stream:", error);
      this.isConnected = false;
      await this.handleReconnection(error);
    }
  }

  private async handleReconnection(error: any): Promise<void> {
    if (shutdownRequested) return;
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts exceeded, shutting down");
      process.exit(1);
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * this.reconnectAttempts, this.maxReconnectDelay);
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (!shutdownRequested) {
      await this.start();
    }
  }

  stop(): void {
    this.isConnected = false;
    if (streamCleanup) {
      streamCleanup();
      streamCleanup = undefined;
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      startTick: this.startTick.toString(),
      paused,
      queueSizes: {
        ticks: ticksQueue.length,
        transactions: txQueue.length
      }
    };
  }
}

// Decoder worker pool (optional cache)
import { Worker } from "worker_threads";
const workers: Worker[] = [];
let rr = 0;

function startWorkers() {
  if (!DECODED_CACHE) return;
  for (let i = 0; i < WORKERS; i++) {
    const w = new Worker(
      new URL("./decoder-worker.ts", import.meta.url).pathname
    );
    w.on("message", (msg: any) => {
      const results = msg?.results as {
        tx_hash: string;
        payload_text?: string;
      }[];
      if (!results) return;
      // Best-effort cache write; do not wrap in transaction here
      for (const r of results) {
        if (r.payload_text) {
          try {
            db.insertDecoded?.run(r.tx_hash, r.payload_text);
          } catch {}
        }
      }
    });
    w.on("error", (err) => console.error("worker error", err));
    workers.push(w);
  }
}

function dispatchDecodeJobs(txs: TxRow[]) {
  if (!DECODED_CACHE || workers.length === 0) return;
  // send in chunks
  const chunkSize = 500;
  for (let i = 0; i < txs.length; i += chunkSize) {
    const chunk = txs.slice(i, i + chunkSize).map((x) => ({
      tx_hash: x.tx_hash,
      payload: x.payload || undefined,
      signature: x.signature,
      public_key: x.public_key,
    }));
    const w = workers[rr++ % workers.length];
    w.postMessage({ jobs: chunk, payloadText: true, hex: false });
  }
}

async function gracefulShutdown(): Promise<void> {
  console.log("Initiating graceful shutdown...");
  shutdownRequested = true;

  // Stop accepting new ticks
  if (streamManager) {
    streamManager.stop();
  }

  // Clear flush timer
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = undefined;
  }

  // Final flush of remaining data
  if (ticksQueue.length > 0 || txQueue.length > 0) {
    console.log(`Flushing remaining data: ${ticksQueue.length} ticks, ${txQueue.length} transactions`);
    await flushBatch();
  }

  // Close workers
  for (const worker of workers) {
    await worker.terminate();
  }

  // Close database
  try {
    db.db.close();
  } catch (e) {
    console.error("Error closing database:", e);
  }

  console.log("Graceful shutdown complete");
}

let streamManager: StreamManager;

async function main() {
  console.log("🚀 Starting tick ingestor");
  console.log("📋 Configuration:");
  console.log(`  • gRPC Address: ${GRPC_ADDR}`);
  console.log(`  • SQLite Path: ${SQLITE_PATH}`);
  console.log(`  • Start Tick: ${START_TICK.toString()}`);
  console.log(`  • Batch Limits: ${TICK_MAX} ticks, ${TX_MAX} transactions`);
  console.log(`  • Flush Interval: ${FLUSH_MS}ms`);
  console.log(`  • Queue High Water: ${QUEUE_HIGH_WATER}`);
  console.log(`  • Workers: ${WORKERS}`);
  console.log(`  • Decoded Cache: ${DECODED_CACHE}`);

  // Setup graceful shutdown handlers
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM');
    await gracefulShutdown();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('Received SIGINT');
    await gracefulShutdown();
    process.exit(0);
  });

  process.on('uncaughtException', async (error) => {
    console.error('Uncaught exception:', error);
    await gracefulShutdown();
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    await gracefulShutdown();
    process.exit(1);
  });

  startWorkers();

  const client = new GrpcClient(GRPC_ADDR);

  let startFrom = START_TICK;
  try {
    const row = db.getState.get();
    if (row?.value && row.value > 0 && startFrom === 0n) {
      startFrom = BigInt(row.value + 1);
      console.log(`📖 Resuming from stored state: tick ${startFrom}`);
    } else if (startFrom === 0n) {
      console.log(`🆕 Starting fresh from tick ${startFrom}`);
    } else {
      console.log(`🎯 Starting from specified tick ${startFrom}`);
    }
  } catch (e) {
    console.warn("⚠️ Failed to read stored state:", e);
  }

  // Initialize and start stream manager
  streamManager = new StreamManager(client, startFrom);
  await streamManager.start();

  // Start periodic status logging
  setInterval(() => {
    if (!shutdownRequested) {
      const status = streamManager.getStatus();
      const statusIcon = status.connected ? "🟢" : "🔴";
      const pausedIcon = status.paused ? "⏸️" : "▶️";
      console.log(`${statusIcon} Status: connected=${status.connected} ${pausedIcon} paused=${status.paused} | Queues: ${status.queueSizes.ticks} ticks, ${status.queueSizes.transactions} txs | Reconnects: ${status.reconnectAttempts}`);
    }
  }, 30000); // Log every 30 seconds

  console.log("✅ Tick ingestor started successfully");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
