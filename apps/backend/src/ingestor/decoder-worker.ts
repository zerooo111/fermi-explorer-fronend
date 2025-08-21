// Worker to decode transaction buffers without blocking the main loop.
// In Bun, standard Web Worker API is available.

type DecodeJob = {
  tx_hash: string;
  payload?: Uint8Array;
  signature?: Uint8Array;
  public_key?: Uint8Array;
};

type DecodeResult = {
  tx_hash: string;
  payload_text?: string;
  signature_hex?: string;
  public_key_hex?: string;
};

function toHex(buf?: Uint8Array): string | undefined {
  if (!buf) return undefined;
  let out = "";
  for (let i = 0; i < buf.length; i++) {
    const h = buf[i].toString(16).padStart(2, "0");
    out += h;
  }
  return out;
}

function decodeUtf8(buf?: Uint8Array): string | undefined {
  if (!buf) return undefined;
  try {
    return new TextDecoder().decode(buf);
  } catch {
    return undefined;
  }
}

self.onmessage = (ev: MessageEvent) => {
  const jobs: DecodeJob[] = ev.data?.jobs ?? [];
  const wantHex: boolean = ev.data?.hex ?? false;
  const wantPayloadText: boolean = ev.data?.payloadText ?? true;
  const results: DecodeResult[] = jobs.map((j) => ({
    tx_hash: j.tx_hash,
    payload_text: wantPayloadText ? decodeUtf8(j.payload) : undefined,
    signature_hex: wantHex ? toHex(j.signature) : undefined,
    public_key_hex: wantHex ? toHex(j.public_key) : undefined,
  }));
  // Post result in small chunks to avoid large messages
  // For simplicity in MVP, post once
  // @ts-ignore - self is WorkerGlobalScope
  self.postMessage({ results });
};

