import { useParams } from "@tanstack/react-router";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useTransaction } from "@/hooks";
import { useEffect } from "react";

export default function TransactionPage() {
  const { transactionId } = useParams({ from: "/tx/$transactionId" });

  // Use the simplified useTick hook
  const {
    data: txData,
    isLoading,
    isError,
    error,
  } = useTransaction(transactionId);

  useEffect(() => {
    console.log(txData);
  }, [txData]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-neutral-800 rounded mb-4 sm:mb-6 w-1/2"></div>
          <div className="mobile-scroll-table">
            <div className="w-full">
              <div className="space-y-0">
                {[...Array(6)].map((_, i) => (
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
        <span className="text-base sm:text-2xl">Error loading transaction</span>
        <p className="text-sm sm:text-base text-neutral-400 text-center">
          {error?.message || 'Failed to load transaction data'}
        </p>
        <a href="/" className={buttonVariants({ variant: "default" })}>
          Return to home
        </a>
      </div>
    );
  }

  if (!txData?.found) {
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
        {" "}
        Transaction: {txData.tx_hash}
      </h1>
      <div className="mobile-scroll-table">
        <Table className="w-full">
          <TableBody>
            {/* Sequence number */}
            <TableRow>
              <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Sequencer number{" "}
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {txData.sequence_number}
              </TableCell>
            </TableRow>
            {/* Tick number */}
            <TableRow>
              <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Tick number
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {txData.tick_number}
              </TableCell>
            </TableRow>
            {/* Ingestions timestamp */}
            <TableRow>
              <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Ingestion Timestamp{" "}
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {txData.transaction?.ingestion_timestamp}
              </TableCell>
            </TableRow>
            {/* Nonce */}
            <TableRow>
              <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Nonce
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {txData.transaction?.nonce}
              </TableCell>
            </TableRow>
            {/* Payload size */}
            <TableRow>
              <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Payload size
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono">
                {txData.transaction?.payload_size}
              </TableCell>
            </TableRow>
            {/* Tx Hash */}
            <TableRow>
              <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
                Tx Hash
              </TableCell>
              <TableCell className="text-xs sm:text-sm font-mono break-all">
                {txData.tx_hash}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="mt-8">
          <a href="/" className={buttonVariants({ variant: "default" })}>
            Return to home
          </a>
        </div>
      </div>
    </div>
  );
}
