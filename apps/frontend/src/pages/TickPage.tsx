import { useParams } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useTick } from "@/hooks/useTick";

export default function TickPage() {
  const { tickId } = useParams({ from: "/tick/$tickId" });

  // Convert tickId to number
  const tickNumber = parseInt(tickId, 10);

  // Use the simplified useTick hook
  const { data: tickData, isLoading, isError, error } = useTick(tickNumber);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-neutral-800 rounded mb-4 sm:mb-6 w-1/2"></div>
          <div className="mobile-scroll-table">
            <div className="w-full">
              <div className="space-y-0">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex">
                    <div className="h-10 bg-neutral-900/50 flex-1 border-b border-neutral-800"></div>
                    <div className="h-10 bg-neutral-800/50 flex-1 border-b border-neutral-800"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
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
        <a href="/" className={buttonVariants({ variant: "default" })}>
          Return to home
        </a>
      </div>
    );
  }

  if (!tickData?.found) {
    return (
      <div className="container max-w-screen-xl flex items-center justify-center mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-col gap-3 sm:gap-4">
        <span className="text-base sm:text-2xl">Tick not found</span>
        <a href="/" className={buttonVariants({ variant: "default" })}>
          Return to home
        </a>
      </div>
    );
  }

  // Tick found
  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
        {" "}
        Tick #{tickData.tick_number}{" "}
      </h1>
      <div className="mobile-scroll-table">
        <Table className="w-full">
          <TableBody>
            {/* Transaction Batch Hash */}
            <TableRow>
              <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Transaction batch hash{" "}
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono break-all">
                {tickData.tick?.transaction_batch_hash}
              </TableCell>
            </TableRow>
            {/* Timestamp */}
            <TableRow>
              <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Timestamp{" "}
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {tickData.tick?.timestamp}
              </TableCell>
            </TableRow>
            {/* Transaction count */}
            <TableRow>
              <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Transaction count{" "}
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {tickData.tick?.transaction_count}
              </TableCell>
            </TableRow>
            {/* Vdf Iterations */}
            <TableRow>
              <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Vdf Iteration
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {tickData.tick?.vdf_iterations}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="mt-8">
          <a href="/" className={buttonVariants({ variant: "default" })}>
            {" "}
            Return to home
          </a>
        </div>
      </div>
    </div>
  );
}
