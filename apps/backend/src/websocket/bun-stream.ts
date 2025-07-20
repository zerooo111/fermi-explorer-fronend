import { GrpcClient, Tick } from '../grpc/client';

interface WebSocketClient {
  id: string;
  ws: any; // Bun's WebSocket
  lastPing: number;
  isActive: boolean;
  startTick: bigint;
  latestTick?: Tick;
  needsUpdate: boolean;
  grpcCleanup?: () => void;
}

export class BunStreamHandler {
  private grpcClient: GrpcClient;
  private clients: Map<any, WebSocketClient> = new Map(); // Key by WebSocket object
  private metrics = {
    activeConnections: 0,
    totalConnections: 0,
    droppedConnections: 0,
    broadcastErrors: 0
  };

  constructor(grpcClient: GrpcClient) {
    this.grpcClient = grpcClient;
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${++this.metrics.totalConnections}`;
  }



  onWebSocketConnection(ws: any, startTick: bigint): void {
    const clientId = this.generateClientId();
    const client: WebSocketClient = {
      id: clientId,
      ws,
      lastPing: Date.now(),
      isActive: true,
      startTick,
      needsUpdate: false
    };

    this.clients.set(ws, client);
    this.metrics.activeConnections++;

    console.log(`WebSocket client ${clientId} connected, starting from tick ${startTick}`);

    // Start streaming ticks
    this.startTickStream(client);

  }

  onWebSocketClose(ws: any): void {
    const client = this.clients.get(ws);
    if (client) {
      this.removeClient(ws);
    }
  }

  private startTickStream(client: WebSocketClient): void {
    client.grpcCleanup = this.grpcClient.streamTicks(
      client.startTick,
      (tick) => {
        this.updateLatestTick(client, tick);
      },
      (error) => {
        if (client.isActive) {
          console.error(`Tick streaming error for client ${client.id}:`, error);
          this.sendErrorToClient(client, error.message);
        }
      }
    );
  }

  private updateLatestTick(client: WebSocketClient, tick: Tick): void {
    if (!client.isActive) return;

    client.latestTick = tick;
    this.sendTickToClient(client, tick);
  }

  private sendTickToClient(client: WebSocketClient, tick: Tick): void {
    if (!client.isActive) return;

    const tickData = {
      type: 'tick',
      tick_number: tick.tick_number,
      timestamp: tick.timestamp,
      transaction_count: tick.transactions.length,
      transaction_batch_hash: tick.transaction_batch_hash,
      previous_output: tick.previous_output,
      vdf_proof: tick.vdf_proof,
      transactions: tick.transactions.map(tx => ({
        tx_id: tx.transaction.tx_id,
        sequence_number: tx.sequence_number,
        nonce: tx.transaction.nonce,
        ingestion_timestamp: tx.ingestion_timestamp,
        payload_size: tx.transaction.payload ? tx.transaction.payload.length : 0
      }))
    };

    try {
      client.ws.send(JSON.stringify(tickData));
    } catch (error) {
      console.error(`Failed to send tick to client ${client.id}:`, error);
      client.isActive = false;
      this.metrics.broadcastErrors++;
    }
  }

  private sendErrorToClient(client: WebSocketClient, errorMsg: string): void {
    if (!client.isActive) return;

    const errorData = {
      type: 'error',
      error: errorMsg
    };

    try {
      client.ws.send(JSON.stringify(errorData));
    } catch (error) {
      console.error(`Failed to send error to client ${client.id}:`, error);
    }
  }

  private removeClient(ws: any): void {
    const client = this.clients.get(ws);
    if (!client) return;

    client.isActive = false;
    
    
    // Clean up gRPC stream
    if (client.grpcCleanup) {
      client.grpcCleanup();
    }
    
    this.clients.delete(ws);
    this.metrics.activeConnections--;
    
    console.log(`Client ${client.id} disconnected`);
  }

  shutdown(): void {
    console.log('🔌 Starting WebSocket handler shutdown...');
    
    for (const [ws, client] of this.clients.entries()) {
      client.isActive = false;
      
      
      if (client.grpcCleanup) {
        client.grpcCleanup();
      }
      
      try {
        ws.close();
      } catch (error) {
        console.warn(`Error closing WebSocket for client ${client.id}:`, error);
      }
    }
    
    this.clients.clear();
    this.metrics.activeConnections = 0;
    
    console.log('✅ WebSocket handler shutdown complete');
  }

  getMetrics() {
    return { ...this.metrics };
  }
}