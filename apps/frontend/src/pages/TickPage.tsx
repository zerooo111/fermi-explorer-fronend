import { Link, useParams } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useTick } from "@/hooks/useTick";

export default function TickPage() {
	const { tickId } = useParams({ from: "/tick/$tickId" });

	// Convert tickId to number
	const tickNumber = parseInt(tickId, 10);

	// Use the simplified useTick hook
	const { data: tickData, isLoading, isError, error } = useTick(tickNumber);

	const isValidTickNumber = !isNaN(tickNumber) && tickNumber > 0;

	// Trend calculation for NumberFlow

	// Handle invalid tick number
	if (!isValidTickNumber) {
		return (
			<div className="container mx-auto px-6 py-8">
				<div className="max-w-4xl mx-auto">
					<div className="border border-red-700 bg-red-950 p-6 rounded-lg">
						<h1 className="text-2xl font-bold font-mono tracking-tight text-red-400 mb-4 uppercase">
							Invalid Tick Number
						</h1>
						<p className="text-red-500 font-mono text-sm mb-4">
							"{tickId}" is not a valid tick number. Tick numbers must be
							positive integers.
						</p>
						<Link
							to="/"
							className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors font-mono text-sm uppercase tracking-wide"
						>
							Return to Home
						</Link>
					</div>
				</div>
			</div>
		);
	}

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

	if (!tickData?.found) {
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
			<h1> Tick #{tickData.tick_number} </h1>
			<Table className="w-full">
				<TableBody>
					{/* Transaction Batch Hash */}
					<TableRow>
						<TableCell>Transaction batch hash </TableCell>
						<TableCell>{tickData.tick?.transaction_batch_hash}</TableCell>
					</TableRow>
					{/* Timestamp */}
					<TableRow>
						<TableCell>Timestamp </TableCell>
						<TableCell>{tickData.tick?.timestamp}</TableCell>
					</TableRow>
					{/* Transaction count */}
					<TableRow>
						<TableCell>Transaction count </TableCell>
						<TableCell>{tickData.tick?.transaction_count}</TableCell>
					</TableRow>
					{/* Vdf Iterations */}
					<TableRow>
						<TableCell>Vdf Iteration</TableCell>
						<TableCell>{tickData.tick?.vdf_iterations}</TableCell>
					</TableRow>
					{/* Vdf Iterations */}
					<TableRow>
						<TableCell></TableCell>
						<TableCell>{tickData.tick_number}</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>
	);
}
