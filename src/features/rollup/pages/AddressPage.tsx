import { useParams } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/shared/components/ui/table";

export default function AddressPage() {
  const { pubkey } = useParams({ from: "/rollup/address/$pubkey" });

  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl font-bold mb-2">Address Details</h1>
        <p className="text-zinc-400 font-mono text-xs sm:text-sm break-all">
          {pubkey}
        </p>
      </div>

      <div className="rounded-lg border border-yellow-800 bg-yellow-950/50 p-6 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-label="Warning icon"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-400 font-mono">
              Address Tracking Not Yet Implemented
            </h3>
            <div className="mt-2 text-sm text-yellow-300 font-mono">
              <p>
                Address-specific transaction history requires custom indexing.
                This feature will be added in a future update.
              </p>
              <p className="mt-2">To implement this feature, you'll need to:</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Create a database index on transaction owner fields</li>
                <li>Add a new API endpoint to query transactions by owner</li>
                <li>Build the frontend integration for the new endpoint</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-zinc-700 p-4 sm:p-6 bg-zinc-900/50">
        <h2 className="text-base sm:text-lg font-bold font-mono tracking-tight text-zinc-100 uppercase mb-4">
          Address Information
        </h2>
        <div className="mobile-scroll-table">
          <Table className="w-full">
            <TableBody>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
                  Public Key
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono break-all text-zinc-100 py-2 sm:py-3">
                  {pubkey}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs py-2 bg-neutral-900/50 sm:text-sm font-mono">
                  Address Type
                </TableCell>
                <TableCell className="text-xs sm:text-sm font-mono text-zinc-100">
                  Solana Public Key (Base58)
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
