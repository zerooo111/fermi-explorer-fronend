import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { join, dirname } from "path";

import type { VdfProof as SharedVdfProof } from "@fermi/shared-types/api";

interface Transaction {
  tx_id: string;
  payload: Uint8Array;
  signature: Uint8Array;
  public_key: Uint8Array;
  nonce: string;
  timestamp: string;
}

// Use the shared VdfProof type but with string iterations for gRPC
interface VdfProof extends Omit<SharedVdfProof, "iterations"> {
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

interface GetChainStateResponse {
  chain_height: string;
  total_transactions: string;
  recent_ticks: Tick[];
  tx_to_tick_sample: { [key: string]: string };
}

interface SubmitTransactionResponse {
  sequence_number: string;
  expected_tick: string;
  tx_hash: string;
}

interface SubmitBatchResponse {
  responses: SubmitTransactionResponse[];
}

export class GrpcClient {
  private client: any;
  private address: string;

  constructor(address: string) {
    this.address = address;
    this.connect();
  }

  private connect(): void {
    // Handle both development and production environments
    let protoPath: string;

    // Check if we're running from a bundled file (production)
    if (
      process.argv[0]?.includes("bun") &&
      process.argv[1]?.includes("dist/main.js")
    ) {
      // Running from built bundle - proto should be in dist/proto
      protoPath = join(process.cwd(), "dist", "proto", "sequencer.proto");
    } else {
      // Development mode - check multiple possible locations for proto file
      const possiblePaths = [
        join(process.cwd(), "proto", "sequencer.proto"), // Current directory
        join(process.cwd(), "apps", "backend", "proto", "sequencer.proto"), // From root
        join(__dirname, "..", "..", "proto", "sequencer.proto"), // From src relative
      ];

      protoPath =
        possiblePaths.find((path) => {
          try {
            require("fs").accessSync(path);
            return true;
          } catch {
            return false;
          }
        }) || possiblePaths[0]; // Fallback to first path if none found
    }

    const packageDefinition = protoLoader.loadSync(protoPath, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    const protoDescriptor = grpc.loadPackageDefinition(
      packageDefinition
    ) as any;
    const SequencerService =
      protoDescriptor.continuum.sequencer.v1.SequencerService;

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

  async submitTransaction(
    transaction: Transaction
  ): Promise<SubmitTransactionResponse> {
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

  async submitBatch(transactions: Transaction[]): Promise<SubmitBatchResponse> {
    return new Promise((resolve, reject) => {
      this.client.SubmitBatch(
        { transactions },
        (error: any, response: SubmitBatchResponse) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  async getChainState(tickLimit?: number): Promise<GetChainStateResponse> {
    return new Promise((resolve, reject) => {
      this.client.GetChainState(
        { tick_limit: tickLimit || 0 },
        (error: any, response: GetChainStateResponse) => {
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        }
      );
    });
  }

  streamTicks(
    startTick: bigint = 0n,
    onTick: (tick: Tick) => void,
    onError?: (error: any) => void
  ): () => void {
    const stream = this.client.StreamTicks({
      start_tick: startTick.toString(),
    });

    stream.on("data", (tick: Tick) => {
      onTick(tick);
    });

    stream.on("error", (error: any) => {
      console.error("gRPC stream error:", error);
      if (onError) {
        onError(error);
      }
    });

    stream.on("end", () => {
      console.log("gRPC stream ended");
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

export type {
  Tick,
  Transaction,
  VdfProof,
  OrderedTransaction,
  GetStatusResponse,
  GetTransactionResponse,
  GetTickResponse,
  GetChainStateResponse,
  SubmitBatchResponse,
};
