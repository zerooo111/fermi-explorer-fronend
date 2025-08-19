import {
  GrpcClient,
  type Tick,
  type OrderedTransaction,
} from "../grpc/client.js";
import { writeFileSync, appendFileSync } from "fs";
import { join } from "path";

export interface TickLoggerConfig {
  grpcAddress: string;
  startTick?: bigint;
  reconnectDelay?: number;
  logLevel?: "basic" | "detailed" | "full";
}

export class TickLogger {
  private grpcClient: GrpcClient;
  private config: TickLoggerConfig;
  private streamCleanup?: () => void;
  private isRunning = false;
  private reconnectTimeout?: NodeJS.Timeout;
  private tickCount = 0;
  private transactionCount = 0;
  private startTime: Date = new Date();
  private logFilePath: string;

  constructor(config: TickLoggerConfig) {
    this.config = {
      logLevel: "detailed",
      ...config,
    };
    this.grpcClient = new GrpcClient(config.grpcAddress);
    this.logFilePath = join(process.cwd(), "tick-sequence.log");

    // Initialize log file
    const timestamp = new Date().toISOString();
    const logLevel = this.config.logLevel || "detailed";
    writeFileSync(
      this.logFilePath,
      `# Tick Logger Started at ${timestamp}\n# Log Level: ${logLevel}\n# Format varies by log level\n`
    );
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("Tick logger is already running");
      return;
    }

    console.log("🚀 Starting tick logger service...");
    console.log(`📡 Connecting to gRPC server: ${this.config.grpcAddress}`);
    console.log(`📝 Log level: ${this.config.logLevel}`);

    this.isRunning = true;
    this.startTime = new Date();
    this.startStream();
  }

  async stop(): Promise<void> {
    console.log("🛑 Stopping tick logger service...");
    this.isRunning = false;

    if (this.streamCleanup) {
      this.streamCleanup();
      this.streamCleanup = undefined;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }

    this.grpcClient.close();
    this.logStats();
  }

  private startStream(): void {
    if (!this.isRunning) return;

    console.log(
      `🎯 Starting gRPC stream from tick ${this.config.startTick || 0n}`
    );

    this.streamCleanup = this.grpcClient.streamTicks(
      this.config.startTick || 0n,
      (tick: Tick) => {
        try {
          this.processTick(tick);
        } catch (error) {
          console.error("❌ Error processing tick:", error);
        }
      },
      (error: any) => {
        console.error("🔥 gRPC stream error:", error);
        this.handleStreamError();
      }
    );
  }

  private handleStreamError(): void {
    if (!this.isRunning) return;

    const delay = this.config.reconnectDelay || 5000;
    console.log(`🔄 Attempting to reconnect in ${delay}ms...`);

    this.reconnectTimeout = setTimeout(() => {
      if (this.isRunning) {
        console.log("🔌 Reconnecting to gRPC stream...");
        this.startStream();
      }
    }, delay);
  }

  private processTick(tick: Tick): void {
    this.tickCount++;
    this.transactionCount += tick.transactions.length;

    switch (this.config.logLevel) {
      case "basic":
        this.logBasic(tick);
        break;
      case "detailed":
        this.logDetailed(tick);
        break;
      case "full":
        this.logFull(tick);
        break;
    }
  }

  private logToFile(content: string): void {
    appendFileSync(this.logFilePath, content + '\n');
  }

  private logBasic(tick: Tick): void {
    const logMessage = `📊 Tick #${tick.tick_number}: ${JSON.stringify(tick, null, 2)}`;
    console.log(logMessage);
    this.logToFile(logMessage);
  }

  private logDetailed(tick: Tick): void {
    const timestamp = new Date(Number(BigInt(tick.timestamp) / 1000n));
    const txCount = tick.transactions.length;

    if (txCount > 0) {
      const logMessages = [];
      
      logMessages.push(`\n📊 === TICK #${tick.tick_number} ===`);
      logMessages.push(`⏰ Timestamp: ${timestamp.toISOString()}`);
      logMessages.push(`💼 Transactions: ${txCount}`);
      logMessages.push(`🔗 Batch Hash: ${tick.transaction_batch_hash.slice(0, 16)}...`);
      logMessages.push(`🔐 VDF Output: ${tick.vdf_proof.output.slice(0, 16)}...`);
      logMessages.push(`🔹 Transaction summaries:`);
      
      tick.transactions.slice(0, 5).forEach((tx, index) => {
        logMessages.push(`   ${index + 1}. ${tx.tx_hash.slice(0, 12)}... (ID: ${tx.transaction.tx_id})`);
      });
      
      if (txCount > 5) {
        logMessages.push(`   ... and ${txCount - 5} more transactions`);
      }
      
      logMessages.push(`🔍 Full transaction details: ${JSON.stringify(tick.transactions, null, 2)}`);
      
      // Output to both console and file
      logMessages.forEach(message => {
        console.log(message);
        this.logToFile(message);
      });
    }
  }

  private logFull(tick: Tick): void {
    const timestamp = new Date(Number(BigInt(tick.timestamp) / 1000n));

    if (tick.transactions.length > 0) {
      const logMessages = [];
      
      logMessages.push(`\n📊 ===== FULL TICK #${tick.tick_number} =====`);
      logMessages.push(`⏰ Timestamp: ${timestamp.toISOString()}`);
      logMessages.push(`💼 Transaction Count: ${tick.transactions.length}`);
      logMessages.push(`🔗 Batch Hash: ${tick.transaction_batch_hash}`);
      logMessages.push(`🔒 Previous Output: ${tick.previous_output}`);

      logMessages.push(`\n🔐 VDF Proof:`);
      logMessages.push(`   Input: ${tick.vdf_proof.input}`);
      logMessages.push(`   Output: ${tick.vdf_proof.output}`);
      logMessages.push(`   Proof: ${tick.vdf_proof.proof.slice(0, 32)}...`);
      logMessages.push(`   Iterations: ${tick.vdf_proof.iterations}`);

      logMessages.push(`\n💳 Transactions:`);
      tick.transactions.forEach((tx, index) => {
        const txTimestamp = new Date(
          Number(BigInt(tx.transaction.timestamp) / 1000n)
        );
        const ingestionTimestamp = new Date(
          Number(BigInt(tx.ingestion_timestamp) / 1000n)
        );

        logMessages.push(`   Transaction #${index + 1}:`);
        logMessages.push(`     Hash: ${tx.tx_hash}`);
        logMessages.push(`     ID: ${tx.transaction.tx_id}`);
        logMessages.push(`     Sequence: ${tx.sequence_number}`);
        logMessages.push(`     Nonce: ${tx.transaction.nonce}`);
        logMessages.push(`     Timestamp: ${txTimestamp.toISOString()}`);
        logMessages.push(`     Ingestion: ${ingestionTimestamp.toISOString()}`);
        logMessages.push(`     Payload Size: ${tx.transaction.payload.length} bytes`);
        logMessages.push(`     Signature: ${Buffer.from(tx.transaction.signature).toString("hex").slice(0, 32)}...`);
        logMessages.push(`     Public Key: ${Buffer.from(tx.transaction.public_key).toString("hex").slice(0, 32)}...`);
      });

      logMessages.push(`🔍 Full transaction details: ${JSON.stringify(tick.transactions, null, 2)}`);
      logMessages.push(`========================================\n`);
      
      // Output to both console and file
      logMessages.forEach(message => {
        console.log(message);
        this.logToFile(message);
      });
    }
  }

  private logStats(): void {
    const uptime = (new Date().getTime() - this.startTime.getTime()) / 1000;
    const avgTps = this.transactionCount / uptime;

    console.log(`\n📈 === TICK LOGGER STATS ===`);
    console.log(`🔢 Total Ticks Processed: ${this.tickCount}`);
    console.log(`💼 Total Transactions: ${this.transactionCount}`);
    console.log(`⏱️ Uptime: ${Math.floor(uptime)}s`);
    console.log(`📊 Average TPS: ${avgTps.toFixed(2)}`);
    console.log(`========================\n`);
  }

  getStatus(): {
    isRunning: boolean;
    grpcAddress: string;
    tickCount: number;
    transactionCount: number;
    uptime: number;
  } {
    const uptime = (new Date().getTime() - this.startTime.getTime()) / 1000;

    return {
      isRunning: this.isRunning,
      grpcAddress: this.config.grpcAddress,
      tickCount: this.tickCount,
      transactionCount: this.transactionCount,
      uptime,
    };
  }
}
