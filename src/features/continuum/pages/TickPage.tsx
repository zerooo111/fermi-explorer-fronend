import { useParams, Link } from "@tanstack/react-router";
import { buttonVariants } from "@/shared/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Card, CardContent, Alert, AlertDescription, PageSkeleton, TableSkeleton } from "@/shared/components/ui";
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
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Alert variant="error" className="mb-6">
          <AlertDescription>
            <div className="space-y-2">
              <div className="text-base sm:text-lg font-medium">Error loading tick</div>
              <p className="text-sm">
                {error?.message || 'Failed to load tick data'}
              </p>
            </div>
          </AlertDescription>
        </Alert>
        <a href="/sequencing" className={buttonVariants({ variant: "default" })}>
          Return to home
        </a>
      </div>
    );
  }

  // Check if tick data exists
  if (!tickData?.tick_number) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Alert variant="error" className="mb-6">
          <AlertDescription>
            <div className="space-y-2">
              <div className="text-base sm:text-lg font-medium">Tick not found</div>
              <p className="text-sm">
                The requested tick does not exist or is not yet available.
              </p>
            </div>
          </AlertDescription>
        </Alert>
        <a href="/sequencing" className={buttonVariants({ variant: "default" })}>
          Return to home
        </a>
      </div>
    );
  }

  // Tick found - render using new ContinuumTick format
  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8 bg-background">
      <h1 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-foreground">
        Tick #{tickData.tick_number}
      </h1>

      <Card variant="default" className="mb-6">
        <CardContent className="p-0">
          <div className="mobile-scroll-table">
            <Table className="w-full">
              <TableBody>
                {/* Tick Number */}
                <TableRow>
                  <TableCell className="text-xs whitespace-nowrap py-2 bg-secondary sm:text-sm font-mono font-medium">
                    Tick Number
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm font-mono text-foreground">
                    {tickData.tick_number}
                  </TableCell>
                </TableRow>

                {/* Timestamp */}
                <TableRow>
                  <TableCell className="text-xs whitespace-nowrap py-2 bg-secondary sm:text-sm font-mono font-medium">
                    Timestamp
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm font-mono text-foreground">
                    {formatMicroseconds(tickData.timestamp)}
                  </TableCell>
                </TableRow>

                {/* Transaction Count */}
                <TableRow>
                  <TableCell className="text-xs whitespace-nowrap py-2 bg-secondary sm:text-sm font-mono font-medium">
                    Transaction Count
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm font-mono text-foreground">
                    {tickData.transaction_count}
                  </TableCell>
                </TableRow>

                {/* Transaction Batch Hash */}
                <TableRow>
                  <TableCell className="text-xs whitespace-nowrap py-2 bg-secondary sm:text-sm font-mono font-medium">
                    Transaction Batch Hash
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm font-mono break-all text-foreground">
                    {tickData.transaction_batch_hash}
                  </TableCell>
                </TableRow>

                {/* VDF Proof - if available */}
                {tickData.vdf_proof && (
                  <>
                    <TableRow>
                      <TableCell className="text-xs whitespace-nowrap py-2 bg-secondary sm:text-sm font-mono font-medium">
                        VDF Iterations
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm font-mono text-foreground">
                        {tickData.vdf_proof.iterations}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-xs whitespace-nowrap py-2 bg-secondary sm:text-sm font-mono font-medium">
                        VDF Input
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm font-mono break-all text-foreground">
                        {tickData.vdf_proof.input}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-xs whitespace-nowrap py-2 bg-secondary sm:text-sm font-mono font-medium">
                        VDF Output
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm font-mono break-all text-foreground">
                        {tickData.vdf_proof.output}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-xs whitespace-nowrap py-2 bg-secondary sm:text-sm font-mono font-medium">
                        VDF Proof
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm font-mono break-all text-foreground">
                        {tickData.vdf_proof.proof}
                      </TableCell>
                    </TableRow>
                  </>
                )}

                {/* Previous Output */}
                {tickData.previous_output && (
                  <TableRow>
                    <TableCell className="text-xs whitespace-nowrap py-2 bg-secondary sm:text-sm font-mono font-medium">
                      Previous Output
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm font-mono break-all text-foreground">
                      {tickData.previous_output}
                    </TableCell>
                  </TableRow>
                )}

              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Section */}
      {tickData.transactions && tickData.transactions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-base sm:text-lg font-bold mb-4 text-foreground">
            Transactions ({tickData.transactions.length})
          </h2>
          <Card variant="default">
            <CardContent className="p-0">
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
                        <TableCell className="text-xs sm:text-sm font-mono px-4 py-2 text-foreground">
                          <Link
                            to="/sequencing/tx/$transactionId"
                            params={{ transactionId: tx.tx_hash }}
                            className="hover:text-foreground hover:underline"
                          >
                            {tx.tx_hash.slice(0, 8)}...{tx.tx_hash.slice(-8)}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm font-mono px-4 py-2 text-foreground">
                          <Link
                            to="/sequencing/tx/$transactionId"
                            params={{ transactionId: tx.tx_hash }}
                            className="hover:text-foreground hover:underline"
                          >
                            {tx.tx_id.length > 30 ? `${tx.tx_id.slice(0, 30)}...` : tx.tx_id}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm font-mono px-4 py-2 text-foreground">
                          {tx.sequence_number}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm font-mono px-4 py-2 text-foreground">
                          {tx.nonce}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
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
