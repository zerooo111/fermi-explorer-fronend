import { Hono } from "hono";
import { cors } from "hono/cors";
import { GrpcClient } from "./grpc/client";
import { Handler } from "./handlers/handlers";
import { loadAppConfig } from "./config/env";
import {
  panicRecovery,
  simpleLogging,
  requestSizeLimit,
} from "./middleware/validation";
import { metricsMiddleware } from "./middleware/metrics";
import { initializeMetrics } from "./metrics/metrics";
import { BunStreamHandler } from "./websocket/bun-stream";

class Server {
  private app: Hono;
  private server?: any;
  private grpcClient?: GrpcClient;
  private streamHandler?: BunStreamHandler;
  private config = loadAppConfig();

  constructor() {
    this.app = new Hono();

    // Initialize metrics first
    initializeMetrics();

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Panic recovery middleware
    this.app.use("*", panicRecovery());

    // Metrics middleware (before logging to track all requests)
    this.app.use("*", metricsMiddleware());

    // Logging middleware
    this.app.use("*", simpleLogging());

    // CORS middleware
    this.app.use(
      "*",
      cors({
        origin: this.config.corsAllowedOrigins,
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: [
          "Accept",
          "Content-Type",
          "Content-Length",
          "Accept-Encoding",
          "X-CSRF-Token",
          "Authorization",
        ],
        credentials: this.config.corsAllowCredentials,
      })
    );
  }

  private setupRoutes(): void {
    // Initialize gRPC client
    this.grpcClient = new GrpcClient(this.config.grpcAddr);

    // Initialize WebSocket stream handler
    this.streamHandler = new BunStreamHandler(this.grpcClient);

    // Initialize handlers
    const handler = new Handler(this.grpcClient, this.config.restAddr, this.config.matchEngineUrl);

    // Health and status routes
    this.app.get("/api/v1/health", (c) => handler.health(c));
    this.app.get("/api/v1/status", (c) => handler.status(c));

    // Metrics endpoint (Prometheus format)
    this.app.get("/metrics", (c) => handler.metrics(c));

    // Transaction routes
    this.app.get("/api/v1/tx/:hash", (c) => handler.getTransaction(c));
    this.app.post("/api/v1/tx", requestSizeLimit(), (c) =>
      handler.submitTransaction(c)
    );
    this.app.post("/api/v1/tx/batch", requestSizeLimit(), (c) =>
      handler.submitBatch(c)
    );

    // Tick routes
    this.app.get("/api/v1/tick/:number", (c) => handler.getTick(c));
    this.app.get("/api/v1/ticks/recent", (c) => handler.getRecentTicks(c));

    // Chain state route
    this.app.get("/api/v1/chain/state", (c) => handler.getChainState(c));

    // Market routes
    this.app.get("/me/markets", (c) => handler.getMarkets(c));
    this.app.get("/me/markets/:marketId/orderbook", (c) => handler.getMarketOrderbook(c));

    // Root endpoint
    this.app.get("/", (c) => {
      return c.json({
        service: "fermi-explorer-bun-backend",
        version: "1.0.0",
        endpoints: {
          health: "/api/v1/health",
          status: "/api/v1/status",
          metrics: "/metrics",
          transaction: "/api/v1/tx/{hash}",
          submit_transaction: "/api/v1/tx",
          submit_batch: "/api/v1/tx/batch",
          tick: "/api/v1/tick/{number}",
          recent_ticks: "/api/v1/ticks/recent",
          chain_state: "/api/v1/chain/state",
          websocket: "/ws/ticks",
          markets: "/me/markets",
          market_orderbook: "/me/markets/{marketId}/orderbook",
        },
      });
    });
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      console.log(`🛑 Received ${signal}, starting graceful shutdown...`);

      try {
        // Stop accepting new connections
        if (this.server) {
          console.log("📡 Shutting down HTTP server...");
          this.server.stop();
          console.log("✅ HTTP server shutdown complete");
        }

        // Close WebSocket connections
        if (this.streamHandler) {
          console.log("🔌 Shutting down WebSocket handler...");
          this.streamHandler.shutdown();
          console.log("✅ WebSocket handler shutdown complete");
        }

        // Close gRPC client
        if (this.grpcClient) {
          console.log("📡 Closing gRPC client...");
          this.grpcClient.close();
          console.log("✅ gRPC client closed");
        }

        console.log("🏁 Server stopped gracefully");
        process.exit(0);
      } catch (error) {
        console.error("❌ Error during shutdown:", error);
        process.exit(1);
      }
    };

    // Handle shutdown signals
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      shutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason) => {
      console.error("❌ Unhandled Rejection:", reason);
      shutdown("unhandledRejection");
    });
  }

  async start(): Promise<void> {
    try {
      console.log("🚀 Starting fermi-explorer-bun-backend...");

      // Test gRPC connection
      if (this.grpcClient) {
        try {
          await this.grpcClient.getStatus();
          console.log(`Connected to gRPC server at ${this.config.grpcAddr}`);
        } catch (error) {
          console.warn(
            `⚠️  Could not connect to gRPC server at ${this.config.grpcAddr}:`,
            error
          );
          console.log(
            "🔄 Server will continue, but gRPC functionality may be limited"
          );
        }
      }

      // Start the server with WebSocket support
      this.server = Bun.serve({
        port: parseInt(this.config.httpPort),
        fetch: (req, server) => {
          // Handle WebSocket upgrades
          if (req.headers.get("upgrade") === "websocket") {
            const url = new URL(req.url);
            if (url.pathname === "/ws/ticks") {
              const startTick = url.searchParams.get("start_tick") || "0";

              if (
                server.upgrade(req, {
                  data: { startTick: BigInt(startTick) },
                })
              ) {
                return; // Successfully upgraded
              }
              return new Response("WebSocket upgrade failed", { status: 400 });
            }
          }

          // Handle regular HTTP requests
          return this.app.fetch(req, server);
        },
        websocket: {
          open: (ws) => {
            const startTick =
              (ws.data as { startTick?: bigint })?.startTick || 0n;
            this.streamHandler?.onWebSocketConnection(ws, startTick);
          },
          message: (ws, message) => {
            // Handle incoming WebSocket messages if needed
            console.log("Received WebSocket message:", message);
          },
          close: (ws) => {
            this.streamHandler?.onWebSocketClose(ws);
          },
          drain: (ws) => {
            // Handle backpressure
          },
        },
      });

      // Setup graceful shutdown
      this.setupGracefulShutdown();

      console.log(
        `🌐 REST API: http://localhost:${this.config.httpPort}/api/v1`
      );
      console.log(
        `🔌 WebSocket: ws://localhost:${this.config.httpPort}/ws/ticks`
      );
      console.log(
        `📊 Metrics: http://localhost:${this.config.httpPort}/metrics`
      );
      console.log(`📡 Proxying gRPC from: ${this.config.grpcAddr}`);
      console.log(`🔗 Proxying REST from: ${this.config.restAddr}`);
      console.log(`🎯 Proxying Match Engine from: ${this.config.matchEngineUrl}`);
      console.log("✅ Server started successfully");
    } catch (error) {
      console.error("❌ Failed to start server:", error);
      process.exit(1);
    }
  }
}

// Start the server
const server = new Server();
server.start().catch((error) => {
  console.error("❌ Server startup failed:", error);
  process.exit(1);
});
