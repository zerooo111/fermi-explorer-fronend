import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-zinc-950">
			<div className="flex flex-col items-center gap-4">
				<Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
				<p className="text-sm font-mono text-zinc-400 uppercase tracking-wider">
					Loading...
				</p>
			</div>
		</div>
	);
}

