import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { join } from 'path'
import type { VdfProof as SharedVdfProof } from '@fermi/shared-types/api'

interface Transaction {
  tx_id: string;
  payload: Uint8Array;
  signature: Uint8Array;
  public_key: Uint8Array;
  nonce: string;
  timestamp: string;
}

// Use the shared VdfProof type but with string iterations for gRPC
interface VdfProof extends Omit<SharedVdfProof, 'iterations'> {
  iterations: string; // gRPC uses string instead of number
}

interface OrderedTransaction {
  transaction: Transaction;
  sequence_number: string;
  tx_hash: string;
  ingestion_timestamp: string;
}

interface Tick {
  tick_number: string;
  vdf_proof: VdfProof;
  transactions: OrderedTransaction[];
  transaction_batch_hash: string;
  timestamp: string;
  previous_output: string;
}

interface GetStatusResponse {
  current_tick: string;
  total_transactions: string;
  pending_transactions: string;
  uptime_seconds: string;
  transactions_per_second: number;
}

interface GetTransactionResponse {
  transaction: OrderedTransaction;
  tick_number: string;
  found: boolean;
}

interface GetTickResponse {
  tick: Tick;
  found: boolean;
}

interface SubmitTransactionResponse {
  sequence_number: string;
  expected_tick: string;
  tx_hash: string;
}

export class GrpcClient {
  private client: any;
  private address: string;

  constructor(address: string) {
    this.address = address;
    this.connect();
  }

  private connect(): void {
    const PROTO_PATH = join(process.cwd(), 'proto', 'sequencer.proto');
    
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
    const SequencerService = protoDescriptor.continuum.sequencer.v1.SequencerService;

    this.client = new SequencerService(
      this.address,
      grpc.credentials.createInsecure()
    );
  }

  async getStatus(): Promise<GetStatusResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetStatus({}, (error: any, response: GetStatusResponse) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getTransaction(txHash: string): Promise<GetTransactionResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetTransaction(
        { tx_hash: txHash },
        (error: any, response: GetTransactionResponse) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  async getTick(tickNumber: bigint): Promise<GetTickResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetTick(
        { tick_number: tickNumber.toString() },
        (error: any, response: GetTickResponse) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  async submitTransaction(transaction: Transaction): Promise<SubmitTransactionResponse> {
    return new Promise((resolve, reject) => {
      this.client.SubmitTransaction(
        { transaction },
        (error: any, response: SubmitTransactionResponse) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  streamTicks(startTick: bigint = 0n, onTick: (tick: Tick) => void, onError?: (error: any) => void): () => void {
    const stream = this.client.StreamTicks({ start_tick: startTick.toString() });
    
    stream.on('data', (tick: Tick) => {
      onTick(tick);
    });

    stream.on('error', (error: any) => {
      console.error('gRPC stream error:', error);
      if (onError) {
        onError(error);
      }
    });

    stream.on('end', () => {
      console.log('gRPC stream ended');
    });

    // Return cleanup function
    return () => {
      stream.destroy();
    };
  }

  close(): void {
    this.client.close();
  }
}

export type { Tick, Transaction, VdfProof, OrderedTransaction, GetStatusResponse, GetTransactionResponse, GetTickResponse };