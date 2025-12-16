import { useParams } from "@tanstack/react-router";
import { buttonVariants } from "@/shared/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/shared/components/ui/table";
import { PageSkeleton, TableSkeleton } from "@/shared/components/ui/skeleton";
import { useContinuumTransaction } from "@/features/continuum/hooks/useTransaction";

function formatMicroseconds(microseconds: number): string {
  const date = new Date(microseconds / 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatISOTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function decodeBase64(base64: string): string {
  try {
    return atob(base64);
  } catch {
    return base64;
  }
}

function tryParseJson(str: string): object | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function parsePayload(payload: string): { decoded: string; json: object | null } {
  const decoded = decodeBase64(payload);
  // Check if it starts with a protocol prefix like "FRM_v1.0:"
  const colonIndex = decoded.indexOf(':');
  if (colonIndex > 0 && colonIndex < 20) {
    const jsonPart = decoded.slice(colonIndex + 1);
    const json = tryParseJson(jsonPart);
    return { decoded, json };
  }
  const json = tryParseJson(decoded);
  return { decoded, json };
}

function base64ToHex(base64: string): string {
  try {
    const binary = atob(base64);
    return Array.from(binary, (char) =>
      char.charCodeAt(0).toString(16).padStart(2, '0')
    ).join('');
  } catch {
    return base64;
  }
}

export default function TransactionPage() {
  const { transactionId } = useParams({ from: "/sequencing/tx/$transactionId" });

  const {
    data: txData,
    isLoading,
    isError,
    error,
  } = useContinuumTransaction(transactionId);

  // Handle loading state
  if (isLoading) {
    return (
      <PageSkeleton titleWidth="w-3/4">
        <div className="space-y-8">
          <TableSkeleton rows={10} />
          <div className="bg-neutral-900/50 p-4 rounded-lg animate-pulse">
            <div className="space-y-2">
              <div className="h-4 bg-neutral-700 rounded w-full"></div>
              <div className="h-4 bg-neutral-700 rounded w-5/6"></div>
              <div className="h-4 bg-neutral-700 rounded w-4/5"></div>
              <div className="h-4 bg-neutral-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </PageSkeleton>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="container max-w-screen-xl flex items-center justify-center mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-col gap-3 sm:gap-4">
        <span className="text-base sm:text-2xl">Error loading transaction</span>
        <p className="text-sm sm:text-base text-neutral-400 text-center">
          {error?.message || "Failed to load transaction data"}
        </p>
        <a href="/sequencing" className={buttonVariants({ variant: "default" })}>
          Return to home
        </a>
      </div>
    );
  }

  if (!txData?.tx_hash) {
    return (
      <div className="container max-w-screen-xl flex items-center justify-center mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-col gap-3 sm:gap-4">
        <span className="text-base sm:text-2xl">Transaction not found</span>
        <a href="/sequencing" className={buttonVariants({ variant: "default" })}>
          Return to home
        </a>
      </div>
    );
  }

  // Transaction found - render using new ContinuumTransaction format
  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 break-all">
        Transaction: {txData.tx_hash}
      </h1>

      <div className="space-y-8">
        {/* Transaction Information */}
        <div className="mobile-scroll-table">
          <Table className="w-full">
            <TableBody>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Transaction Hash
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono break-all">
                  {txData.tx_hash}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Transaction ID
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono break-all">
                  {txData.tx_id}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Sequence Number
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono">
                  {txData.sequence_number}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Tick Number
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono">
                  <a
                    href={`/sequencing/tick/${txData.tick_number}`}
                    target="_blank"
                    className="hover:text-zinc-100 hover:underline"
                  >
                    {txData.tick_number}
                  </a>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Nonce
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono">
                  {txData.nonce}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Client Timestamp
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono">
                  {formatMicroseconds(txData.client_timestamp)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Ingestion Timestamp
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono">
                  {formatMicroseconds(txData.ingestion_timestamp)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Created At
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono">
                  {formatISOTimestamp(txData.created_at)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Public Key
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono break-all">
                  {base64ToHex(txData.public_key)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Signature
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono break-all">
                  {base64ToHex(txData.signature)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Parsed Payload Section */}
        {(() => {
          const { decoded, json } = parsePayload(txData.payload);
          return (
            <>
              {json && (
                <div>
                  <h2 className="text-lg font-bold mb-4">Parsed Payload</h2>
                  <div className="bg-neutral-900/50 p-4 rounded-lg">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                      {JSON.stringify(json, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold mb-4">Decoded Payload</h2>
                <div className="bg-neutral-900/50 p-4 rounded-lg">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                    {decoded}
                  </pre>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold mb-4">Raw Payload (Base64)</h2>
                <div className="bg-neutral-900/50 p-4 rounded-lg">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                    {txData.payload}
                  </pre>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      <div className="mt-8">
        <a href="/sequencing" className={buttonVariants({ variant: "default" })}>
          Return to home
        </a>
      </div>
    </div>
  );
}
