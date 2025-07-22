import { Link, useParams } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useTransaction } from "@/hooks";
import { useTick } from "@/hooks/useTick";

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
			<div className="container mx-auto px-6 py-8">
				<Loader2 className="animate-spin " /> Loading ...
			</div>
		);
	}

	// Handle error state
	if (isError) {
		return (
			<div className="container mx-auto px-6 py-8">
				<pre>{JSON.stringify(error.message)}</pre>
			</div>
		);
	}

	if (!txData?.found) {
		return (
			<div className="container mx-auto px-6 py-8 flex flex-col gap-4">
				Tick not found
				<a href="/" className={buttonVariants({ variant: "default" })}>
					{" "}
					Return to home
				</a>
			</div>
		);
	}

	// Tick found
	return (
		<div className="container mx-auto px-6 py-8">
			<h1> Transaction: {txData.tx_hash}</h1>
			<Table className="w-full">
				<TableBody>
					{/* Sequence number */}
					<TableRow>
						<TableCell>Sequencer number </TableCell>
						<TableCell>{txData.sequence_number}</TableCell>
					</TableRow>
					{/* Tick number */}
					<TableRow>
						<TableCell>Tick number</TableCell>
						<TableCell>{txData.tick_number}</TableCell>
					</TableRow>
					{/* Ingestions timestamp */}
					<TableRow>
						<TableCell>Ingestion Timestamp </TableCell>
						<TableCell>{txData.transaction?.ingestion_timestamp}</TableCell>
					</TableRow>
					{/* Nonce */}
					<TableRow>
						<TableCell>Nonce</TableCell>
						<TableCell>{txData.transaction?.nonce}</TableCell>
					</TableRow>
					{/* Payload size */}
					<TableRow>
						<TableCell>Payload size</TableCell>
						<TableCell>{txData.transaction?.payload_size}</TableCell>
					</TableRow>
					{/* Payload size */}
					<TableRow>
						<TableCell>Tx Hash</TableCell>
						<TableCell>{txData.tx_hash}</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>
	);
}
