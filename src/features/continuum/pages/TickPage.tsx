import { useParams, Link } from "@tanstack/react-router";
import { buttonVariants } from "@/shared/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { PageSkeleton, TableSkeleton } from "@/shared/components/ui/skeleton";
import { useContinuumTick } from "@/features/continuum/hooks/useTick";

function formatMicroseconds(microseconds: number): string {
  const date = new Date(microseconds / 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export default function TickPage() {
  const { tickId } = useParams({ from: "/sequencing/tick/$tickId" });

  // Convert tickId to number
  const tickIdNumber = parseInt(tickId, 10);

  // Use the new Continuum API hook
  const { data: tickData, isLoading, isError, error } = useContinuumTick(tickIdNumber);

  // Handle loading state
  if (isLoading) {
    return (
      <PageSkeleton titleWidth="w-1/3">
        <TableSkeleton rows={8} />
      </PageSkeleton>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="container max-w-screen-xl flex items-center justify-center mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-col gap-3 sm:gap-4">
        <span className="text-base sm:text-2xl">Error loading tick</span>
        <p className="text-sm sm:text-base text-neutral-400 text-center">
          {error?.message || 'Failed to load tick data'}
        </p>
        <a href="/sequencing" className={buttonVariants({ variant: "default" })}>
          Return to home
        </a>
      </div>
    );
  }

  // Check if tick data exists
  if (!tickData?.tick_number) {
    return (
      <div className="container max-w-screen-xl flex items-center justify-center mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-col gap-3 sm:gap-4">
        <span className="text-base sm:text-2xl">Tick not found</span>
        <a href="/sequencing" className={buttonVariants({ variant: "default" })}>
          Return to home
        </a>
      </div>
    );
  }

  // Tick found - render using new ContinuumTick format
  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
        Tick #{tickData.tick_number}
      </h1>

      <div className="mobile-scroll-table">
        <Table className="w-full">
          <TableBody>
            {/* Tick Number */}
            <TableRow>
              <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Tick Number
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {tickData.tick_number}
              </TableCell>
            </TableRow>

            {/* Timestamp */}
            <TableRow>
              <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Timestamp
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {formatMicroseconds(tickData.timestamp)}
              </TableCell>
            </TableRow>

            {/* Transaction Count */}
            <TableRow>
              <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Transaction Count
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {tickData.transaction_count}
              </TableCell>
            </TableRow>

            {/* Transaction Batch Hash */}
            <TableRow>
              <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Transaction Batch Hash
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono break-all">
                {tickData.transaction_batch_hash}
              </TableCell>
            </TableRow>

            {/* VDF Proof - if available */}
            {tickData.vdf_proof && (
              <>
                <TableRow>
                  <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                    VDF Iterations
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm font-mono">
                    {tickData.vdf_proof.iterations}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                    VDF Input
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm font-mono break-all">
                    {tickData.vdf_proof.input}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                    VDF Output
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm font-mono break-all">
                    {tickData.vdf_proof.output}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                    VDF Proof
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm font-mono break-all">
                    {tickData.vdf_proof.proof}
                  </TableCell>
                </TableRow>
              </>
            )}

            {/* Previous Output */}
            {tickData.previous_output && (
              <TableRow>
                <TableCell className="text-xs whitespace-nowrap py-2 bg-neutral-900/50 sm:text-sm font-mono">
                  Previous Output
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono break-all">
                  {tickData.previous_output}
                </TableCell>
              </TableRow>
            )}

          </TableBody>
        </Table>
      </div>

      {/* Transactions Section */}
      {tickData.transactions && tickData.transactions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-base sm:text-lg font-bold mb-4">
            Transactions ({tickData.transactions.length})
          </h2>
          <div className="mobile-scroll-table">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm font-mono px-4 py-2">TX Hash</TableHead>
                  <TableHead className="text-xs sm:text-sm font-mono px-4 py-2">TX ID</TableHead>
                  <TableHead className="text-xs sm:text-sm font-mono px-4 py-2">Sequence #</TableHead>
                  <TableHead className="text-xs sm:text-sm font-mono px-4 py-2">Nonce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickData.transactions.map((tx) => (
                  <TableRow key={tx.tx_hash}>
                    <TableCell className="text-xs sm:text-sm font-mono px-4 py-2">
                      <Link
                        to="/sequencing/tx/$transactionId"
                        params={{ transactionId: tx.tx_hash }}
                        className="hover:text-zinc-100 hover:underline"
                      >
                        {tx.tx_hash.slice(0, 8)}...{tx.tx_hash.slice(-8)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm font-mono px-4 py-2">
                      <Link
                        to="/sequencing/tx/$transactionId"
                        params={{ transactionId: tx.tx_hash }}
                        className="hover:text-zinc-100 hover:underline"
                      >
                        {tx.tx_id.length > 30 ? `${tx.tx_id.slice(0, 30)}...` : tx.tx_id}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm font-mono px-4 py-2">
                      {tx.sequence_number}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm font-mono px-4 py-2">
                      {tx.nonce}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="mt-8">
        <a href="/sequencing" className={buttonVariants({ variant: "default" })}>
          Return to home
        </a>
      </div>
    </div>
  );
}
