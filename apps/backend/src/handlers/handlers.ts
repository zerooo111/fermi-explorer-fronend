import { Context } from 'hono'
import { GrpcClient, GetStatusResponse, GetTransactionResponse, GetTickResponse } from '../grpc/client'
import { 
  validateTransactionHash, 
  validateTickNumber, 
  validateQueryParams, 
  sanitizeInput, 
  sendErrorResponse,
  limits 
} from '../middleware/validation'
import { HTTP_STATUS } from '@fermi/shared-utils/constants'

export class Handler {
  private grpcClient: GrpcClient;
  private restBaseURL: string;

  constructor(grpcClient: GrpcClient, restBaseURL: string) {
    this.grpcClient = grpcClient;
    this.restBaseURL = restBaseURL;
  }

  private async makeSecureRequest(method: string, url: string, body?: any): Promise<Response> {
    const headers: Record<string, string> = {
      'User-Agent': 'fermi-explorer-proxy/1.0',
      'Accept': 'application/json'
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), limits.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async health(c: Context): Promise<Response> {
    if (c.req.method !== 'GET') {
      return sendErrorResponse(c, 405, 'Method not allowed');
    }

    const response = {
      status: 'healthy',
      timestamp: Math.floor(Date.now() / 1000),
      version: '1.0.0'
    };

    return c.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }

  async status(c: Context): Promise<Response> {
    if (c.req.method !== 'GET') {
      return sendErrorResponse(c, 405, 'Method not allowed');
    }

    try {
      const statusResponse: GetStatusResponse = await this.grpcClient.getStatus();
      
      return c.json(statusResponse, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    } catch (error) {
      console.error('❌ Status endpoint error:', error);
      return sendErrorResponse(c, 503, 'Failed to get status from sequencer');
    }
  }

  async getTransaction(c: Context): Promise<Response> {
    if (c.req.method !== 'GET') {
      return sendErrorResponse(c, 405, 'Method not allowed');
    }

    const txHash = sanitizeInput(c.req.param('hash') || '');
    
    const validationError = validateTransactionHash(txHash);
    if (validationError) {
      return sendErrorResponse(c, 400, 'Invalid transaction hash', [validationError]);
    }

    try {
      const resp = await this.makeSecureRequest('GET', `${this.restBaseURL}/tx/${txHash}`);
      
      if (!resp.ok) {
        if (resp.status === 404) {
          return sendErrorResponse(c, 404, 'Transaction not found');
        }
        return sendErrorResponse(c, 502, 'Failed to get transaction');
      }

      const data = await resp.json();
      console.log(`✅ Successfully retrieved transaction: ${txHash}`);
      
      return c.json(data, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    } catch (error) {
      console.error(`❌ Failed to get transaction ${txHash}:`, error);
      return sendErrorResponse(c, 500, 'Failed to get transaction');
    }
  }

  async getTick(c: Context): Promise<Response> {
    if (c.req.method !== 'GET') {
      return sendErrorResponse(c, 405, 'Method not allowed');
    }

    const tickNumStr = sanitizeInput(c.req.param('number') || '');
    
    const { value: tickNum, error: validationError } = validateTickNumber(tickNumStr);
    if (validationError) {
      return sendErrorResponse(c, 400, 'Invalid tick number', [validationError]);
    }

    try {
      const resp = await this.makeSecureRequest('GET', `${this.restBaseURL}/tick/${tickNumStr}`);
      
      if (!resp.ok) {
        if (resp.status === 404) {
          return sendErrorResponse(c, 404, 'Tick not found');
        }
        return sendErrorResponse(c, 502, 'Failed to get tick');
      }

      const data = await resp.json();
      console.log(`✅ Successfully retrieved tick: ${tickNum}`);
      
      return c.json(data, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    } catch (error) {
      console.error(`❌ Failed to get tick ${tickNum}:`, error);
      return sendErrorResponse(c, 500, 'Failed to get tick');
    }
  }

  async getRecentTicks(c: Context): Promise<Response> {
    if (c.req.method !== 'GET') {
      return sendErrorResponse(c, 405, 'Method not allowed');
    }

    const validationErrors = validateQueryParams(c);
    if (validationErrors.length > 0) {
      return sendErrorResponse(c, 400, 'Invalid query parameters', validationErrors);
    }

    try {
      const url = new URL(c.req.url);
      let targetUrl = `${this.restBaseURL}/ticks/recent`;
      
      if (url.search) {
        const sanitizedQuery = sanitizeInput(url.search.substring(1));
        targetUrl += `?${sanitizedQuery}`;
      }

      const resp = await this.makeSecureRequest('GET', targetUrl);
      
      if (!resp.ok) {
        return sendErrorResponse(c, 502, 'Failed to get recent ticks');
      }

      const data = await resp.json();
      console.log('✅ Successfully retrieved recent ticks');
      
      return c.json(data, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
    } catch (error) {
      console.error('❌ Failed to get recent ticks:', error);
      return sendErrorResponse(c, 500, 'Failed to get recent ticks');
    }
  }

  async submitTransaction(c: Context): Promise<Response> {
    if (c.req.method !== 'POST') {
      return sendErrorResponse(c, 405, 'Method not allowed');
    }

    try {
      const body = await c.req.json();
      
      // Basic validation of transaction structure
      if (!body.transaction) {
        return sendErrorResponse(c, 400, 'Transaction object is required');
      }

      const resp = await this.makeSecureRequest('POST', `${this.restBaseURL}/tx`, body);
      
      if (!resp.ok) {
        const errorText = await resp.text();
        console.error(`❌ Transaction submission failed: ${resp.status} ${errorText}`);
        return sendErrorResponse(c, resp.status, 'Failed to submit transaction');
      }

      const data = await resp.json();
      console.log('✅ Successfully submitted transaction');
      
      return c.json(data);
    } catch (error) {
      console.error('❌ Failed to submit transaction:', error);
      if (error instanceof SyntaxError) {
        return sendErrorResponse(c, 400, 'Invalid JSON in request body');
      }
      return sendErrorResponse(c, 500, 'Failed to submit transaction');
    }
  }
}