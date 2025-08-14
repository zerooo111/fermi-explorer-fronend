import { GrpcClient, type Tick, type OrderedTransaction } from '../grpc/client.js';
import { DatabaseConnection } from '../database/connection.js';

export interface TickStreamerConfig {
  grpcAddress: string;
  database: {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: boolean;
  };
  startTick?: bigint;
  reconnectDelay?: number;
}

export class TickStreamer {
  private grpcClient: GrpcClient;
  private db: DatabaseConnection;
  private config: TickStreamerConfig;
  private streamCleanup?: () => void;
  private isRunning = false;
  private reconnectTimeout?: NodeJS.Timeout;

  constructor(config: TickStreamerConfig) {
    this.config = config;
    this.grpcClient = new GrpcClient(config.grpcAddress);
    this.db = new DatabaseConnection(config.database);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Tick streamer is already running');
      return;
    }

    console.log('Starting tick streamer service...');
    
    // Test database connection
    const dbConnected = await this.db.testConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to TimescaleDB');
    }

    this.isRunning = true;
    this.startStream();
  }

  async stop(): Promise<void> {
    console.log('Stopping tick streamer service...');
    this.isRunning = false;

    if (this.streamCleanup) {
      this.streamCleanup();
      this.streamCleanup = undefined;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }

    await this.db.close();
    this.grpcClient.close();
  }

  private startStream(): void {
    if (!this.isRunning) return;

    console.log(`Starting gRPC stream from tick ${this.config.startTick || 0n}`);

    this.streamCleanup = this.grpcClient.streamTicks(
      this.config.startTick || 0n,
      async (tick: Tick) => {
        try {
          await this.processTick(tick);
        } catch (error) {
          console.error('Error processing tick:', error);
        }
      },
      (error: any) => {
        console.error('gRPC stream error:', error);
        this.handleStreamError();
      }
    );
  }

  private handleStreamError(): void {
    if (!this.isRunning) return;

    console.log(`Attempting to reconnect in ${this.config.reconnectDelay || 5000}ms...`);
    
    this.reconnectTimeout = setTimeout(() => {
      if (this.isRunning) {
        console.log('Reconnecting to gRPC stream...');
        this.startStream();
      }
    }, this.config.reconnectDelay || 5000);
  }

  private async processTick(tick: Tick): Promise<void> {
    console.log(`Processing tick ${tick.tick_number} with ${tick.transactions.length} transactions`);

    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      // Insert tick data
      await this.insertTick(client, tick);

      // Insert transactions
      for (const transaction of tick.transactions) {
        await this.insertTransaction(client, tick.tick_number, transaction);
      }

      await client.query('COMMIT');
      console.log(`Successfully saved tick ${tick.tick_number} to database`);

    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Failed to save tick ${tick.tick_number}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  private async insertTick(client: any, tick: Tick): Promise<void> {
    const insertTickQuery = `
      INSERT INTO ticks (
        tick_number, 
        timestamp, 
        vdf_input, 
        vdf_output, 
        vdf_proof, 
        vdf_iterations,
        transaction_batch_hash, 
        previous_output
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (tick_number, timestamp) DO NOTHING
    `;

    const timestampMs = BigInt(tick.timestamp);
    const timestampDate = new Date(Number(timestampMs / 1000n)); // Convert microseconds to milliseconds

    await client.query(insertTickQuery, [
      BigInt(tick.tick_number),
      timestampDate,
      tick.vdf_proof.input,
      tick.vdf_proof.output,
      tick.vdf_proof.proof,
      BigInt(tick.vdf_proof.iterations),
      tick.transaction_batch_hash,
      tick.previous_output,
    ]);
  }

  private async insertTransaction(client: any, tickNumber: string, transaction: OrderedTransaction): Promise<void> {
    const insertTransactionQuery = `
      INSERT INTO transactions (
        tx_hash,
        tick_number,
        sequence_number,
        tx_id,
        payload,
        signature,
        public_key,
        nonce,
        tx_timestamp,
        ingestion_timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (tx_hash, tick_number) DO NOTHING
    `;

    const txTimestampMs = BigInt(transaction.transaction.timestamp);
    const ingestionTimestampMs = BigInt(transaction.ingestion_timestamp);
    
    const txTimestamp = new Date(Number(txTimestampMs / 1000n)); // Convert microseconds to milliseconds
    const ingestionTimestamp = new Date(Number(ingestionTimestampMs / 1000n));

    await client.query(insertTransactionQuery, [
      transaction.tx_hash,
      BigInt(tickNumber),
      BigInt(transaction.sequence_number),
      transaction.transaction.tx_id,
      transaction.transaction.payload,
      transaction.transaction.signature,
      transaction.transaction.public_key,
      BigInt(transaction.transaction.nonce),
      txTimestamp,
      ingestionTimestamp,
    ]);

    // Log transaction details
    console.log(`  Transaction ${transaction.tx_hash.slice(0, 8)}... - ID: ${transaction.transaction.tx_id} - Nonce: ${transaction.transaction.nonce}`);
  }

  getStatus(): { isRunning: boolean; grpcAddress: string } {
    return {
      isRunning: this.isRunning,
      grpcAddress: this.config.grpcAddress,
    };
  }
}