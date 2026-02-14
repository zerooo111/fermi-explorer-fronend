import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MarketsGrid } from "@/features/rollup/components/v2/markets";

export default function MarketsPage() {
	return (
		<div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
			<div className="mb-6 sm:mb-8">
				<Link
					to="/execution"
					className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors mb-4 group"
				>
					<ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
					Back to Dashboard
				</Link>
				<h1 className="text-lg sm:text-xl font-bold mb-2">Markets</h1>
				<p className="text-sm sm:text-base text-zinc-400">
					Browse all markets on the Fermi rollup
				</p>
			</div>

			<MarketsGrid />
		</div>
	);
}
