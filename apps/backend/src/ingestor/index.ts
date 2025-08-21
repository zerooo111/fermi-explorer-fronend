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
  const txs = t.transactions || [];
  if (txs.length === 0) return; // only store ticks with transactions

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
}

async function flushBatch() {
  if (ticksQueue.length === 0 && txQueue.length === 0) return;
  const start = Date.now();
  const takeTicks = Math.min(ticksQueue.length, TICK_MAX);
  const takeTx = Math.min(txQueue.length, TX_MAX);

  const ticks = ticksQueue.splice(0, takeTicks);
  const txs = txQueue.splice(0, takeTx);

  try {
    db.begin();
    for (const t of ticks) {
      db.insertTick.run(
        t.tick_number,
        t.timestamp,
        t.vdf_input,
        t.vdf_output,
        t.vdf_proof,
        t.vdf_iterations,
        t.transaction_batch_hash,
        t.previous_output
      );
    }
    for (const x of txs) {
      db.insertTx.run(
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
    }
    // update last committed tick if any
    const maxTick = ticks.reduce((m, t) => Math.max(m, t.tick_number), 0);
    if (maxTick > 0) db.upsertState.run(maxTick);
    db.commit();
  } catch (e) {
    console.error("Flush failed, rolling back:", e);
    try {
      db.rollback();
    } catch {}
    // On failure, requeue at head for retry (simple strategy)
    ticksQueue.unshift(...ticks);
    txQueue.unshift(...txs);
  } finally {
    const dur = Date.now() - start;
    if (dur > 500)
      console.warn(
        `Slow flush ${dur}ms for ${ticks.length} ticks / ${txs.length} tx`
      );
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(async () => {
    flushTimer = undefined;
    await flushBatch();
    scheduleFlush();
  }, FLUSH_MS) as unknown as Timer;
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

async function main() {
  console.log("Starting tick ingestor");
  console.log({
    GRPC_ADDR,
    SQLITE_PATH,
    START_TICK: START_TICK.toString(),
    TX_MAX,
    TICK_MAX,
    FLUSH_MS,
    WORKERS,
    DECODED_CACHE,
  });

  startWorkers();

  const client = new GrpcClient(GRPC_ADDR);

  let startFrom = START_TICK;
  try {
    const row = db.getState.get();
    if (row?.value && row.value > 0 && startFrom === 0n) {
      startFrom = BigInt(row.value + 1);
    }
  } catch {}
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
