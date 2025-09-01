import { useParams } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { PageSkeleton, TableSkeleton } from "@/components/ui/skeleton";
import { useTransaction } from "@/hooks";

export default function TransactionPage() {
  const { transactionId } = useParams({ from: "/tx/$transactionId" });

  const {
    data: txData,
    isLoading,
    isError,
    error,
  } = useTransaction(transactionId);

  // Handle loading state
  if (isLoading) {
    return (
      <PageSkeleton titleWidth="w-3/4">
        <div className="space-y-8">
          <TableSkeleton rows={12} />
          <TableSkeleton rows={8} />
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
        <a href="/" className={buttonVariants({ variant: "default" })}>
          Return to home
        </a>
      </div>
    );
  }

  if (!txData?.data) {
    return (
      <div className="container max-w-screen-xl flex items-center justify-center mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-col gap-3 sm:gap-4">
        <span className="text-base sm:text-2xl">Transaction not found</span>
        <a href="/" className={buttonVariants({ variant: "default" })}>
          Return to home
        </a>
      </div>
    );
  }

  // Transaction found
  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 break-all">
        Transaction: {txData.data.tx_hash}
      </h1>
      
      <div className="space-y-8">
        {/* Basic Transaction Information */}
        <div className="mobile-scroll-table">
          <Table className="w-full">
            <TableBody>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Transaction Hash
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono break-all">
                  {txData.data.tx_hash}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Transaction ID
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono">
                  {txData.data.tx_id}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Sequence Number
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono">
                  {txData.data.sequence_number}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Tick Number
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono">
                  <a
                    href={`/tick/${txData.data.tick_number}`}
                    target="_blank"
                    className="hover:text-zinc-100 hover:underline"
                  >
                    {txData.data.tick_number}
                  </a>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Nonce
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono">
                  {txData.data.nonce}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Timestamp
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono">
                  {txData.data.timestamp}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Processed At
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono">
                  {txData.data.processed_at}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Public Key
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono break-all">
                  {txData.data.public_key}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Signature
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono break-all">
                  {txData.data.signature}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Payload Size
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono">
                  {txData.data.payload_size} bytes
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Payload Type
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono">
                  {txData.data.payload_decoded?.data.type || 'N/A'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                  Version
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono">
                  {txData.data.version}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Parsed Payload Section */}
        {txData.data.payload_decoded && (
          <div>
            <h2 className="text-lg font-bold mb-4">Parsed Payload</h2>
            <div className="mobile-scroll-table">
              <Table className="w-full">
                <TableBody>
                  {txData.data.payload_decoded.data.intent && (
                    <>
                      <TableRow>
                        <TableCell colSpan={2} className="text-sm font-bold bg-neutral-800/50 py-3">
                          Order Intent
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                          Order ID
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm font-mono">
                          {txData.data.payload_decoded.data.intent.order_id}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                          Owner
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm font-mono break-all">
                          {txData.data.payload_decoded.data.intent.owner}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                          Side
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm font-mono">
                          {txData.data.payload_decoded.data.intent.side}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                          Base Mint
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm font-mono break-all">
                          {txData.data.payload_decoded.data.intent.base_mint}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                          Quote Mint
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm font-mono break-all">
                          {txData.data.payload_decoded.data.intent.quote_mint}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                          Price
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm font-mono">
                          {txData.data.payload_decoded.data.intent.price}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                          Quantity
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm font-mono">
                          {txData.data.payload_decoded.data.intent.quantity}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                          Expiry
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm font-mono">
                          {txData.data.payload_decoded.data.intent.expiry}
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                  <TableRow>
                    <TableCell colSpan={2} className="text-sm font-bold bg-neutral-800/50 py-3">
                      Metadata
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                      Protocol
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm font-mono">
                      {txData.data.payload_decoded.protocol}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                      Type
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm font-mono">
                      {txData.data.payload_decoded.data.type}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                      Version
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm font-mono">
                      {txData.data.payload_decoded.data.version}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                      Timestamp (ms)
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm font-mono">
                      {txData.data.payload_decoded.data.timestamp_ms}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                      Local Sequencer ID
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm font-mono">
                      {txData.data.payload_decoded.data.local_sequencer_id}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono whitespace-nowrap">
                      Payload Signature
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm font-mono break-all">
                      {txData.data.payload_decoded.data.signature}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Raw Payload Section */}
        <div>
          <h2 className="text-lg font-bold mb-4">Raw Payload</h2>
          <div className="bg-neutral-900/50 p-4 rounded-lg">
            <pre className="text-xs font-mono whitespace-pre-wrap break-words">
              {txData.data.payload}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <a href="/" className={buttonVariants({ variant: "default" })}>
          Return to home
        </a>
      </div>
    </div>
  );
}
