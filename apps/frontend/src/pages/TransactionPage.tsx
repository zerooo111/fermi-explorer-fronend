import {  useParams } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useTransaction } from "@/hooks";

export default function TransactionPage() {
	const { transactionId } = useParams({ from: "/transaction/$transactionId" });

	// Use the simplified useTick hook
	const {
		data: txData,
		isLoading,
		isError,
		error,
	} = useTransaction(transactionId);

	// Handle loading state
	if (isLoading) {
		return (
			<div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
				<Loader2 className="animate-spin " /> Loading ...
			</div>
		);
	}

	// Handle error state
	if (isError) {
		return (
			<div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
				<pre className="text-xs sm:text-sm">{JSON.stringify(error.message)}</pre>
			</div>
		);
	}

	if (!txData?.found) {
		return (
			<div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-3 sm:gap-4">
				<span className="text-base sm:text-lg">Transaction not found</span>
				<a href="/" className={buttonVariants({ variant: "default" })}>
					{" "}
					Return to home
				</a>
			</div>
		);
	}

	// Tick found
	return (
		<div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
			<h1 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 break-all"> Transaction: {txData.tx_hash}</h1>
			<div className="mobile-scroll-table">
				<Table className="w-full">
					<TableBody>
					{/* Sequence number */}
					<TableRow>
						<TableCell className="text-xs sm:text-sm font-mono">Sequencer number </TableCell>
						<TableCell className="text-xs sm:text-sm font-mono">{txData.sequence_number}</TableCell>
					</TableRow>
					{/* Tick number */}
					<TableRow>
						<TableCell className="text-xs sm:text-sm font-mono">Tick number</TableCell>
						<TableCell className="text-xs sm:text-sm font-mono">{txData.tick_number}</TableCell>
					</TableRow>
					{/* Ingestions timestamp */}
					<TableRow>
						<TableCell className="text-xs sm:text-sm font-mono">Ingestion Timestamp </TableCell>
						<TableCell className="text-xs sm:text-sm font-mono">{txData.transaction?.ingestion_timestamp}</TableCell>
					</TableRow>
					{/* Nonce */}
					<TableRow>
						<TableCell className="text-xs sm:text-sm font-mono">Nonce</TableCell>
						<TableCell className="text-xs sm:text-sm font-mono">{txData.transaction?.nonce}</TableCell>
					</TableRow>
					{/* Payload size */}
					<TableRow>
						<TableCell className="text-xs sm:text-sm font-mono">Payload size</TableCell>
						<TableCell className="text-xs sm:text-sm font-mono">{txData.transaction?.payload_size}</TableCell>
					</TableRow>
					{/* Payload size */}
					<TableRow>
						<TableCell className="text-xs sm:text-sm font-mono">Tx Hash</TableCell>
						<TableCell className="text-xs sm:text-sm font-mono break-all">{txData.tx_hash}</TableCell>
					</TableRow>
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
