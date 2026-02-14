import { TerminalLayout, TerminalPanel, TerminalHandle } from "@/shared/components/ui/terminal-layout";
import { StreamTicks } from "@/features/continuum/components/StreamTicks";
import { ChainStatus } from "@/features/continuum/components/ChainStatus";

export default function LiveStreamPage() {
	return (
		<div className="container max-w-screen-xl mx-auto px-0 sm:px-6 py-0 sm:py-6 h-[calc(100vh-4rem)]">
			<TerminalLayout orientation="vertical">
				<TerminalPanel title="Live Tick Stream" defaultSize={70} minSize={30}>
					<div className="p-4">
						<StreamTicks limit={100} />
					</div>
				</TerminalPanel>

				<TerminalHandle />

				<TerminalPanel title="Chain Metrics" defaultSize={30} minSize={15}>
					<div className="p-4">
						<ChainStatus />
					</div>
				</TerminalPanel>
			</TerminalLayout>
		</div>
	);
}
