import { Context } from "hono";
import {
  GrpcClient,
  GetStatusResponse,
  GetTransactionResponse,
  GetTickResponse,
  GetChainStateResponse,
  SubmitBatchResponse,
} from "../grpc/client";
import {
  validateTransactionHash,
  validateTickNumber,
  validateQueryParams,
  sanitizeInput,
  sendErrorResponse,
  limits,
} from "../middleware/validation";
import { MemoryCache } from "../cache/memory-cache";

export class Handler {
  private grpcClient: GrpcClient;
  private restBaseURL: string;
  private matchEngineURL: string;
  private tickCache: MemoryCache<any>;
  private transactionCache: MemoryCache<any>;

  constructor(
    grpcClient: GrpcClient,
    restBaseURL: string,
    matchEngineURL: string
  ) {
    this.grpcClient = grpcClient;
    this.restBaseURL = restBaseURL;
    this.matchEngineURL = matchEngineURL;
    this.tickCache = new MemoryCache<any>(10); // 10 minutes TTL
    this.transactionCache = new MemoryCache<any>(30); // 30 minutes TTL
    
    // Setup periodic cache cleanup
    this.setupCacheCleanup();
  }

  private setupCacheCleanup(): void {
    // Clean up expired cache entries every 5 minutes
    setInterval(() => {
      const tickCleaned = this.tickCache.cleanup();
      const txCleaned = this.transactionCache.cleanup();
      if (tickCleaned + txCleaned > 0) {
        console.log(`🧹 Cache cleanup: removed ${tickCleaned} ticks and ${txCleaned} transactions`);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  private async makeSecureRequest(
    method: string,
    url: string,
    body?: any
  ): Promise<Response> {
    const headers: Record<string, string> = {
      "User-Agent": "fermi-explorer-proxy/1.0",
      Accept: "application/json",
    };

    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), limits.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async health(c: Context): Promise<Response> {
    if (c.req.method !== "GET") {
      return sendErrorResponse(c, 405, "Method not allowed");
    }

    const response = {
      status: "healthy",
      timestamp: Math.floor(Date.now() / 1000),
      version: "1.0.0",
    };

    return c.json(response, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }

  async status(c: Context): Promise<Response> {
    if (c.req.method !== "GET") {
      return sendErrorResponse(c, 405, "Method not allowed");
    }

    try {
      const statusResponse: GetStatusResponse =
        await this.grpcClient.getStatus();

      return c.json(statusResponse, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    } catch (error) {
      console.error("❌ Status endpoint error:", error);
      return sendErrorResponse(c, 503, "Failed to get status from sequencer");
    }
  }

  async getTransaction(c: Context): Promise<Response> {
    if (c.req.method !== "GET") {
      return sendErrorResponse(c, 405, "Method not allowed");
    }

    const txHash = sanitizeInput(c.req.param("hash") || "");

    const validationError = validateTransactionHash(txHash);
    if (validationError) {
      return sendErrorResponse(c, 400, "Invalid transaction hash", [
        validationError,
      ]);
    }

    // Check cache first
    const cacheKey = `tx:${txHash}`;
    const cachedData = this.transactionCache.get(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache hit for transaction: ${txHash}`);
      return c.json(cachedData, {
        headers: {
          "Cache-Control": "private, max-age=1800", // 30 minutes
          "X-Cache": "HIT",
        },
      });
    }

    try {
      const resp = await this.makeSecureRequest(
        "GET",
        `${this.restBaseURL}/tx/${txHash}`
      );

      if (!resp.ok) {
        if (resp.status === 404) {
          return sendErrorResponse(c, 404, "Transaction not found");
        }
        return sendErrorResponse(c, 502, "Failed to get transaction");
      }

      const data = await resp.json();
      console.log(`✅ Successfully retrieved transaction: ${txHash}`);

      // Cache the response
      this.transactionCache.set(cacheKey, data);

      return c.json(data, {
        headers: {
          "Cache-Control": "private, max-age=1800", // 30 minutes
          "X-Cache": "MISS",
        },
      });
    } catch (error) {
      console.error(`❌ Failed to get transaction ${txHash}:`, error);
      return sendErrorResponse(c, 500, "Failed to get transaction");
    }
  }

  async getTick(c: Context): Promise<Response> {
    if (c.req.method !== "GET") {
      return sendErrorResponse(c, 405, "Method not allowed");
    }

    const tickNumStr = sanitizeInput(c.req.param("number") || "");

    const { value: tickNum, error: validationError } =
      validateTickNumber(tickNumStr);
    if (validationError) {
      return sendErrorResponse(c, 400, "Invalid tick number", [
        validationError,
      ]);
    }

    // Check cache first
    const cacheKey = `tick:${tickNumStr}`;
    const cachedData = this.tickCache.get(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache hit for tick: ${tickNum}`);
      return c.json(cachedData, {
        headers: {
          "Cache-Control": "private, max-age=600", // 10 minutes
          "X-Cache": "HIT",
        },
      });
    }

    try {
      const resp = await this.makeSecureRequest(
        "GET",
        `${this.restBaseURL}/tick/${tickNumStr}`
      );

      if (!resp.ok) {
        if (resp.status === 404) {
          return sendErrorResponse(c, 404, "Tick not found");
        }
        return sendErrorResponse(c, 502, "Failed to get tick");
      }

      const data = await resp.json();
      console.log(`✅ Successfully retrieved tick: ${tickNum}`);

      // Cache the response
      this.tickCache.set(cacheKey, data);

      return c.json(data, {
        headers: {
          "Cache-Control": "private, max-age=600", // 10 minutes
          "X-Cache": "MISS",
        },
      });
    } catch (error) {
      console.error(`❌ Failed to get tick ${tickNum}:`, error);
      return sendErrorResponse(c, 500, "Failed to get tick");
    }
  }

  async getRecentTicks(c: Context): Promise<Response> {
    if (c.req.method !== "GET") {
      return sendErrorResponse(c, 405, "Method not allowed");
    }

    const validationErrors = validateQueryParams(c);
    if (validationErrors.length > 0) {
      return sendErrorResponse(
        c,
        400,
        "Invalid query parameters",
        validationErrors
      );
    }

    try {
      const url = new URL(c.req.url);
      let targetUrl = `${this.restBaseURL}/ticks/recent`;

      if (url.search) {
        const sanitizedQuery = sanitizeInput(url.search.substring(1));
        targetUrl += `?${sanitizedQuery}`;
      }

      const resp = await this.makeSecureRequest("GET", targetUrl);

      if (!resp.ok) {
        return sendErrorResponse(c, 502, "Failed to get recent ticks");
      }

      const data = await resp.json();
      console.log("✅ Successfully retrieved recent ticks");

      return c.json(data, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    } catch (error) {
      console.error("❌ Failed to get recent ticks:", error);
      return sendErrorResponse(c, 500, "Failed to get recent ticks");
    }
  }

  async submitTransaction(c: Context): Promise<Response> {
    if (c.req.method !== "POST") {
      return sendErrorResponse(c, 405, "Method not allowed");
    }

    try {
      const body = await c.req.json();
      console.log("bodyReceived", body);
      // Validate transaction structure according to spec
      if (!body.transaction) {
        return sendErrorResponse(c, 400, "Transaction object is required");
      }

      const transaction = body.transaction;

      // Validate required fields
      if (!transaction.tx_id || typeof transaction.tx_id !== "string") {
        return sendErrorResponse(
          c,
          400,
          "tx_id is required and must be a string"
        );
      }

      if (!transaction.signature) {
        return sendErrorResponse(
          c,
          400,
          "signature is required and must be a byte array"
        );
      }

      if (!transaction.public_key) {
        return sendErrorResponse(
          c,
          400,
          "public_key is required and must be a byte array"
        );
      }

      if (
        transaction.nonce === undefined ||
        typeof transaction.nonce !== "number"
      ) {
        return sendErrorResponse(
          c,
          400,
          "nonce is required and must be a number"
        );
      }

      if (!transaction.timestamp) {
        return sendErrorResponse(
          c,
          400,
          "timestamp is required and must be a number"
        );
      }

      // Prepare transaction for gRPC client
      const grpcTransaction = {
        tx_id: transaction.tx_id,
        payload: transaction.payload,
        signature: transaction.signature,
        public_key: transaction.public_key,
        nonce: transaction.nonce.toString(),
        timestamp: transaction.timestamp.toString(),
      };

      console.log("grpcPayload", grpcTransaction);

      // Submit transaction using gRPC client
      const response = await this.grpcClient.submitTransaction(grpcTransaction);

      console.log("✅ Successfully submitted transaction", response);

      // Metrics removed

      return c.json(response);
    } catch (error) {
      console.error("❌ Failed to submit transaction:", error);

      if (error instanceof SyntaxError) {
        return sendErrorResponse(c, 400, "Invalid JSON in request body");
      }
      return sendErrorResponse(c, 500, "Failed to submit transaction");
    }
  }

  async submitBatch(c: Context): Promise<Response> {
    if (c.req.method !== "POST") {
      return sendErrorResponse(c, 405, "Method not allowed");
    }

    try {
      const body = await c.req.json();
      console.log("submitBatch:body", body);

      // Basic validation of batch structure
      if (!body.transactions || !Array.isArray(body.transactions)) {
        return sendErrorResponse(c, 400, "Transactions array is required");
      }

      if (body.transactions.length === 0) {
        return sendErrorResponse(c, 400, "Transactions array cannot be empty");
      }

      // Validate and prepare each transaction
      const grpcTransactions = [];
      for (let i = 0; i < body.transactions.length; i++) {
        const transaction = body.transactions[i];

        // Validate required fields for each transaction
        if (!transaction.tx_id || typeof transaction.tx_id !== "string") {
          return sendErrorResponse(
            c,
            400,
            `Transaction ${i}: tx_id is required and must be a string`
          );
        }

        if (!transaction.payload || !Array.isArray(transaction.payload)) {
          return sendErrorResponse(
            c,
            400,
            `Transaction ${i}: payload is required and must be a byte array`
          );
        }

        if (!transaction.signature || !Array.isArray(transaction.signature)) {
          return sendErrorResponse(
            c,
            400,
            `Transaction ${i}: signature is required and must be a byte array`
          );
        }

        if (!transaction.public_key || !Array.isArray(transaction.public_key)) {
          return sendErrorResponse(
            c,
            400,
            `Transaction ${i}: public_key is required and must be a byte array`
          );
        }

        if (
          transaction.nonce === undefined ||
          typeof transaction.nonce !== "number"
        ) {
          return sendErrorResponse(
            c,
            400,
            `Transaction ${i}: nonce is required and must be a number`
          );
        }

        if (
          !transaction.timestamp ||
          typeof transaction.timestamp !== "number"
        ) {
          return sendErrorResponse(
            c,
            400,
            `Transaction ${i}: timestamp is required and must be a number`
          );
        }

        grpcTransactions.push({
          tx_id: transaction.tx_id,
          payload: new Uint8Array(transaction.payload),
          signature: new Uint8Array(transaction.signature),
          public_key: new Uint8Array(transaction.public_key),
          nonce: transaction.nonce.toString(),
          timestamp: transaction.timestamp.toString(),
        });
      }

      // Submit batch using gRPC client
      const response = await this.grpcClient.submitBatch(grpcTransactions);

      console.log(
        `✅ Successfully submitted ${body.transactions.length} transactions`
      );

      return c.json(response);
    } catch (error) {
      console.error("❌ Failed to submit batch transactions:", error);

      if (error instanceof SyntaxError) {
        return sendErrorResponse(c, 400, "Invalid JSON in request body");
      }
      return sendErrorResponse(c, 500, "Failed to submit batch transactions");
    }
  }

  async getChainState(c: Context): Promise<Response> {
    if (c.req.method !== "GET") {
      return sendErrorResponse(c, 405, "Method not allowed");
    }

    try {
      // Get optional tick_limit parameter
      const tickLimitStr = c.req.query("tick_limit");
      let tickLimit: number | undefined;

      if (tickLimitStr) {
        const parsed = parseInt(tickLimitStr, 10);
        if (isNaN(parsed) || parsed < 0) {
          return sendErrorResponse(c, 400, "Invalid tick_limit parameter");
        }
        tickLimit = parsed;
      }

      const chainState: GetChainStateResponse =
        await this.grpcClient.getChainState(tickLimit);

      return c.json(chainState, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    } catch (error) {
      console.error("❌ Chain state endpoint error:", error);
      return sendErrorResponse(
        c,
        503,
        "Failed to get chain state from sequencer"
      );
    }
  }

  async getMarkets(c: Context): Promise<Response> {
    if (c.req.method !== "GET") {
      return sendErrorResponse(c, 405, "Method not allowed");
    }

    try {
      const resp = await this.makeSecureRequest(
        "GET",
        `${this.matchEngineURL}/markets`
      );

      if (!resp.ok) {
        return sendErrorResponse(c, 502, "Failed to get markets");
      }

      const data = await resp.json();
      console.log("✅ Successfully retrieved markets");

      return c.json(data, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    } catch (error) {
      console.error("❌ Failed to get markets:", error);
      return sendErrorResponse(c, 500, "Failed to get markets");
    }
  }

  async getMarketOrderbook(c: Context): Promise<Response> {
    if (c.req.method !== "GET") {
      return sendErrorResponse(c, 405, "Method not allowed");
    }

    const marketId = sanitizeInput(c.req.param("marketId") || "");

    if (!marketId) {
      return sendErrorResponse(c, 400, "Market ID is required");
    }

    try {
      const resp = await this.makeSecureRequest(
        "GET",
        `${this.matchEngineURL}/markets/${marketId}/orderbook`
      );

      if (!resp.ok) {
        if (resp.status === 404) {
          return sendErrorResponse(c, 404, "Market not found");
        }
        return sendErrorResponse(c, 502, "Failed to get market orderbook");
      }

      const data = await resp.json();
      console.log(
        `✅ Successfully retrieved orderbook for market: ${marketId}`
      );

      // Metrics removed

      return c.json(data, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    } catch (error) {
      console.error(
        `❌ Failed to get orderbook for market ${marketId}:`,
        error
      );
      return sendErrorResponse(c, 500, "Failed to get market orderbook");
    }
  }
}
