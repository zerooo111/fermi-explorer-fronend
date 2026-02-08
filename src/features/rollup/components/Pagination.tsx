import { buttonVariants } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export function Pagination({
	currentPage,
	totalPages,
	onPageChange,
}: PaginationProps) {
	const pages: (number | string)[] = [];
	const maxVisible = 7;

	if (totalPages <= maxVisible) {
		for (let i = 0; i < totalPages; i++) {
			pages.push(i);
		}
	} else {
		if (currentPage <= 3) {
			for (let i = 0; i < 5; i++) {
				pages.push(i);
			}
			pages.push("...");
			pages.push(totalPages - 1);
		} else if (currentPage >= totalPages - 4) {
			pages.push(0);
			pages.push("...");
			for (let i = totalPages - 5; i < totalPages; i++) {
				pages.push(i);
			}
		} else {
			pages.push(0);
			pages.push("...");
			for (let i = currentPage - 1; i <= currentPage + 1; i++) {
				pages.push(i);
			}
			pages.push("...");
			pages.push(totalPages - 1);
		}
	}

	return (
		<div className="flex items-center justify-center gap-2 mt-6">
			<button
				type="button"
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 0}
				className={cn(
					buttonVariants({ variant: "default" }),
					"disabled:opacity-50 disabled:cursor-not-allowed"
				)}
			>
				Previous
			</button>

			<div className="flex gap-1">
				{pages.map((page, index) => {
					if (page === "...") {
						return (
							<span
								key={`ellipsis-${index === 1 ? "start" : "end"}`}
								className="px-3 py-2 text-muted-foreground font-mono"
							>
								...
							</span>
						);
					}

					const pageNum = page as number;
					return (
						<button
							type="button"
							key={pageNum}
							onClick={() => onPageChange(pageNum)}
							className={cn(
								buttonVariants({ variant: pageNum === currentPage ? "default" : "outline" }),
								"min-w-[40px]"
							)}
						>
							{pageNum + 1}
						</button>
					);
				})}
			</div>

			<button
				type="button"
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage >= totalPages - 1}
				className={cn(
					buttonVariants({ variant: "default" }),
					"disabled:opacity-50 disabled:cursor-not-allowed"
				)}
			>
				Next
			</button>
		</div>
	);
}

