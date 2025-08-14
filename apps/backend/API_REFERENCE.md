# Fermi Explorer Backend API Reference

## Submit Transaction Endpoint

### POST `/submit-transaction`

Submits a single transaction to the Continuum sequencer for processing.

#### Request

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Body Schema:**
```json
{
  "transaction": {
    "tx_id": "string",           // Unique transaction identifier
    "payload": [1, 2, 3, ...],   // Transaction payload as byte array (FRM JSON with "FRM_v1.0:" prefix)
    "signature": [1, 2, 3, ...], // Ed25519 signature as byte array
    "public_key": [1, 2, 3, ...], // Client public key as byte array
    "nonce": 123456,             // Nonce for replay protection (number)
    "timestamp": 1692123456789000 // Client timestamp in microseconds since epoch (number)
  }
}
```

**Example Request:**
```json
{
  "transaction": {
    "tx_id": "frm_order_12345",
    "payload": [70, 82, 77, 95, 118, 49, 46, 48, 58, 123, 34, 116, 121, 112, 101, 34, 58, 34, 111, 114, 100, 101, 114, 34],
    "signature": [45, 234, 123, 89, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56],
    "public_key": [32, 156, 78, 45, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56],
    "nonce": 789456,
    "timestamp": 1692123456789000
  }
}
```

#### Response

**Success Response (200 OK):**
```json
{
  "sequence_number": "string",  // Assigned sequence number (uint64 as string)
  "expected_tick": "string",    // Expected tick number for inclusion (uint64 as string) 
  "tx_hash": "string"          // Transaction hash (32-byte hex string)
}
```

**Example Success Response:**
```json
{
  "sequence_number": "12345",
  "expected_tick": "8901",
  "tx_hash": "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

#### Error Responses

**400 Bad Request - Missing Transaction:**
```json
{
  "error": "Transaction object is required",
  "code": 400,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**400 Bad Request - Field Validation:**
```json
{
  "error": "tx_id is required and must be a string",
  "code": 400,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**400 Bad Request - Payload Validation:**
```json
{
  "error": "payload is required and must be a byte array",
  "code": 400,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**400 Bad Request - Signature Validation:**
```json
{
  "error": "signature is required and must be a byte array",
  "code": 400,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**400 Bad Request - Public Key Validation:**
```json
{
  "error": "public_key is required and must be a byte array",
  "code": 400,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**400 Bad Request - Nonce Validation:**
```json
{
  "error": "nonce is required and must be a number",
  "code": 400,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**400 Bad Request - Timestamp Validation:**
```json
{
  "error": "timestamp is required and must be a number",
  "code": 400,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**405 Method Not Allowed:**
```json
{
  "error": "Method not allowed",
  "code": 405,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to submit transaction",
  "code": 500,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**503 Service Unavailable:**
```json
{
  "error": "Failed to submit transaction",
  "code": 503,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### Rate Limiting

- Maximum request size: 1MB
- Concurrent request limit applies
- No explicit rate limiting beyond server capacity

#### Authentication

Currently no authentication is required. The transaction's cryptographic signature provides authenticity.

#### Notes for Frontend Implementation

1. **Transaction ID Generation**: Generate unique `tx_id` values (recommend using timestamp + random suffix)

2. **FRM Payload Format**: The `payload` field must contain FRM transaction JSON wrapped with "FRM_v1.0:" prefix, converted to byte array

3. **Signature Generation**: Generate Ed25519 signature using "FRM_DEX_ORDER:" prefix (not "FRM_v1.0:"), convert to byte array

4. **Nonce Management**: Use random/sequential numbers for replay protection

5. **Timestamp Format**: Use microseconds since Unix epoch (Date.now() * 1000)

6. **Error Handling**: Check for specific field validation errors for better debugging

7. **Retry Logic**: Implement exponential backoff for 5xx errors

#### Example Frontend Integration

```typescript
interface SubmitTransactionRequest {
  transaction: {
    tx_id: string;
    payload: number[];    // byte array
    signature: number[];  // byte array  
    public_key: number[]; // byte array
    nonce: number;
    timestamp: number;
  };
}

interface SubmitTransactionResponse {
  sequence_number: string;
  expected_tick: string;
  tx_hash: string;
}

// FRM Transaction payload structure
interface FrmTransactionPayload {
  type: string;
  intent: {
    order_id: number;
    owner: string;
    side: "Buy" | "Sell";
    price: number;
    quantity: number;
    expiry: number;
    base_mint: string;
    quote_mint: string;
  };
  signature: string;
  local_sequencer_id: string;
  timestamp_ms: number;
}

async function submitTransaction(frmData: FrmTransactionPayload, privateKey: string): Promise<SubmitTransactionResponse> {
  // 1. Create FRM transport wrapper
  const transportPrefix = new TextEncoder().encode("FRM_v1.0:");
  const jsonBytes = new TextEncoder().encode(JSON.stringify(frmData));
  const payload = new Uint8Array([...transportPrefix, ...jsonBytes]);
  
  const transaction = {
    tx_id: `frm_order_${Date.now()}`,
    payload: Array.from(payload),
    signature: Array.from(signTransaction(frmData, privateKey)), // Ed25519 signature
    public_key: Array.from(getPublicKey(privateKey)),
    nonce: Math.floor(Math.random() * 1000000),
    timestamp: Date.now() * 1000 // microseconds
  };

  const response = await fetch('/submit-transaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transaction })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to submit transaction: ${error.error}`);
  }

  return response.json();
}
```

---

## Batch Submit Transactions

### POST `/submit-batch`

Submit multiple transactions in a single request for better throughput.

**Request Body:**
```json
{
  "transactions": [
    {
      "tx_id": "frm_order_12345",
      "payload": [70, 82, 77, 95, 118, 49, 46, 48, 58, 123],
      "signature": [45, 234, 123, 89, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56],
      "public_key": [32, 156, 78, 45, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56, 78, 90, 12, 34, 56],
      "nonce": 789456,
      "timestamp": 1692123456789000
    }
    // ... more transactions
  ]
}
```

**400 Bad Request - Batch Validation:**
```json
{
  "error": "Transaction 0: tx_id is required and must be a string",
  "code": 400,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Response:**
```json
{
  "responses": [
    {
      "sequence_number": "string",
      "expected_tick": "string", 
      "tx_hash": "string"
    }
    // ... one response per input transaction
  ]
}
```