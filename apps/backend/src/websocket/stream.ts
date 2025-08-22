import { WebSocket } from 'ws';
import { GrpcClient, Tick } from '../grpc/client';

interface WebSocketClient {
  id: string;
  ws: WebSocket;
  lastPing: number;
  isActive: boolean;
  startTick: bigint;
  latestTick?: Tick;
}


interface ConnectionMetrics {
  activeConnections: number;
  totalConnections: number;
  droppedConnections: number;
  broadcastErrors: number;
}

export class StreamHandler {
  private grpcClient: GrpcClient;
  private clients: Map<string, WebSocketClient> = new Map();
  private metrics: ConnectionMetrics = {
    activeConnections: 0,
    totalConnections: 0,
    droppedConnections: 0,
    broadcastErrors: 0
  };
  private cleanupInterval?: Timer;
  private maxClients = 1000;

  // Constants
  private readonly DEFAULT_PING_INTERVAL = 30000; // 30 seconds
  private readonly DEFAULT_PONG_TIMEOUT = 10000; // 10 seconds
  private readonly DEFAULT_CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor(grpcClient: GrpcClient) {
    this.grpcClient = grpcClient;
    this.startCleanupRoutine();
  }

  private startCleanupRoutine(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveClients();
    }, this.DEFAULT_CLEANUP_INTERVAL);
  }



  private generateClientId(): string {
    return `client_${Date.now()}_${++this.metrics.totalConnections}`;
  }

  private checkOrigin(origin: string | undefined): boolean {
    if (!origin) {
      return true; // Allow direct connections
    }

    const allowedOriginsEnv = process.env.CORS_ALLOWED_ORIGINS;
    if (!allowedOriginsEnv) {
      const defaultOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:3001'
      ];
      const allowed = defaultOrigins.includes(origin);
      if (!allowed) {
        console.warn(`⚠️  WebSocket origin '${origin}' not in default allowed origins`);
      }
      return allowed;
    }

    const allowedOrigins = allowedOriginsEnv.split(',').map(o => o.trim());
    const allowed = allowedOrigins.includes(origin);
    if (!allowed) {
      console.warn(`⚠️  WebSocket origin '${origin}' not allowed. Allowed origins: ${allowedOriginsEnv}`);
    }
    return allowed;
  }

  handleConnection(ws: WebSocket, request: Request): void {
    const url = new URL(request.url);
    const origin = request.headers.get('origin') || undefined;

    // Check origin
    if (!this.checkOrigin(origin)) {
      ws.close(1008, 'Origin not allowed');
      this.metrics.droppedConnections++;
      return;
    }

    // Check max clients
    if (this.metrics.activeConnections >= this.maxClients) {
      ws.close(1008, 'Maximum clients reached');
      this.metrics.droppedConnections++;
      return;
    }

    // Parse start tick
    const startTickStr = url.searchParams.get('start_tick');
    let startTick = 0n;
    if (startTickStr) {
      try {
        startTick = BigInt(startTickStr);
      } catch {
        console.warn(`Invalid start_tick parameter: ${startTickStr}`);
      }
    }

    const clientId = this.generateClientId();
    const client: WebSocketClient = {
      id: clientId,
      ws,
      lastPing: Date.now(),
      isActive: true,
      startTick
    };

    // Setup client
    this.clients.set(clientId, client);
    this.metrics.activeConnections++;

    console.log(`WebSocket client ${clientId} connected, starting from tick ${startTick}`);

    // Setup event handlers
    this.setupClientHandlers(client);

    // Start ping handler
    this.startPingHandler(client);


    // Start streaming ticks
    this.startTickStream(client);
  }

  private setupClientHandlers(client: WebSocketClient): void {
    client.ws.on('message', (data) => {
      client.lastPing = Date.now();
      try {
        const message = JSON.parse(data.toString());
        console.log(`Received message from client ${client.id}:`, message);
      } catch (error) {
        console.warn(`Invalid JSON from client ${client.id}:`, error);
      }
    });

    client.ws.on('pong', () => {
      client.lastPing = Date.now();
    });

    client.ws.on('close', () => {
      this.removeClient(client.id);
    });

    client.ws.on('error', (error) => {
      console.error(`WebSocket error for client ${client.id}:`, error);
      this.removeClient(client.id);
    });
  }

  private startPingHandler(client: WebSocketClient): void {
    const pingInterval = setInterval(() => {
      if (!client.isActive) {
        clearInterval(pingInterval);
        return;
      }

      const now = Date.now();
      if (now - client.lastPing > this.DEFAULT_PONG_TIMEOUT + this.DEFAULT_PING_INTERVAL) {
        console.log(`Client ${client.id} ping timeout, closing connection`);
        this.removeClient(client.id);
        clearInterval(pingInterval);
        return;
      }

      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.ping();
      }
    }, this.DEFAULT_PING_INTERVAL);
  }


  private startTickStream(client: WebSocketClient): void {
    const cleanup = this.grpcClient.streamTicks(
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

    // Store cleanup function
    client.ws.on('close', cleanup);
  }

  private updateLatestTick(client: WebSocketClient, tick: Tick): void {
    if (!client.isActive) return;

    client.latestTick = tick;
    this.sendTickToClient(client, tick);
  }

  private sendTickToClient(client: WebSocketClient, tick: Tick): void {
    if (!client.isActive || client.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const tickData = {
      type: 'tick',
      tick_number: tick.tick_number,
      timestamp: tick.timestamp,
      transaction_count: tick.transactions.length,
      transaction_batch_hash: tick.transaction_batch_hash,
      previous_output: tick.previous_output,
      vdf_proof: {
        input: tick.vdf_proof.input,
        output: tick.vdf_proof.output,
        proof: tick.vdf_proof.proof,
        iterations: tick.vdf_proof.iterations
      },
      transactions: this.convertTransactions(tick.transactions)
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
    if (!client.isActive || client.ws.readyState !== WebSocket.OPEN) {
      return;
    }

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

  private convertTransactions(transactions: any[]): any[] {
    return transactions.map(tx => ({
      tx_id: tx.transaction.tx_id,
      sequence_number: tx.sequence_number,
      nonce: tx.transaction.nonce,
      ingestion_timestamp: tx.ingestion_timestamp,
      payload_size: tx.transaction.payload ? tx.transaction.payload.length : 0
    }));
  }

  private removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.isActive = false;
    

    // Close WebSocket if still open
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.close();
    }

    this.clients.delete(clientId);
    this.metrics.activeConnections--;
    
    console.log(`Client ${clientId} disconnected`);
  }

  private cleanupInactiveClients(): void {
    for (const [id, client] of this.clients.entries()) {
      if (!client.isActive || client.ws.readyState !== WebSocket.OPEN) {
        this.removeClient(id);
      }
    }
  }

  shutdown(): void {
    console.log('🔌 Starting WebSocket handler shutdown...');
    
    // Stop cleanup routine
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Close all client connections
    for (const [clientId, client] of this.clients.entries()) {
      client.isActive = false;
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.close(1001, 'Server shutting down');
      }
    }
    
    this.clients.clear();
    this.metrics.activeConnections = 0;
    
    console.log('✅ WebSocket handler shutdown complete');
  }

  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }
}
