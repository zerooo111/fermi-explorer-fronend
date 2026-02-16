import { cn } from "@/shared/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse bg-muted", className)}
      {...props}
    />
  );
}

interface TableSkeletonProps {
  rows?: number;
}

export function TableSkeleton({ rows = 6 }: TableSkeletonProps) {
  return (
    <div className="border border-border">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className={cn(
          "flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 px-3 py-2",
          i > 0 && "border-t border-border"
        )}>
          <Skeleton className="h-3 w-24 sm:w-32 shrink-0" />
          <Skeleton className="h-3 w-full max-w-xs" />
        </div>
      ))}
    </div>
  );
}

interface PageSkeletonProps {
  title?: boolean;
  titleWidth?: string;
  children?: React.ReactNode;
}

export function PageSkeleton({
  title = true,
  titleWidth = "w-1/2",
  children
}: PageSkeletonProps) {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-2" />
        <Skeleton className="h-3 w-24" />
      </div>
      {/* Title skeleton */}
      {title && (
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 shrink-0" />
          <Skeleton className={cn("h-5", titleWidth)} />
        </div>
      )}
      {children}
    </div>
  );
}

interface TransactionTableSkeletonProps {
  rows?: number;
}

export function TransactionTableSkeleton({ rows = 6 }: TransactionTableSkeletonProps) {
  return (
    <div className="border border-border">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className={cn(
          "flex items-center gap-3 px-3 py-2.5",
          i > 0 && "border-t border-border"
        )}>
          <Skeleton className="h-3 w-3 shrink-0" />
          <Skeleton className="h-3 w-24 sm:w-40" />
          <div className="flex-1" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20 hidden sm:block" />
        </div>
      ))}
    </div>
  );
}

interface TicksTableSkeletonProps {
  rows?: number;
}

export function TicksTableSkeleton({ rows = 6 }: TicksTableSkeletonProps) {
  return (
    <div className="border border-border">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className={cn(
          "flex items-center gap-3 px-3 py-2.5",
          i > 0 && "border-t border-border"
        )}>
          <Skeleton className="h-3 w-3 shrink-0" />
          <Skeleton className="h-3 w-20" />
          <div className="flex-1" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-3 w-24 hidden sm:block" />
        </div>
      ))}
    </div>
  );
}

interface CardSkeletonProps {
  rows?: number;
}

export function CardSkeleton({ rows = 3 }: CardSkeletonProps) {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="border border-border">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className={cn(
            "flex items-center justify-between px-3 py-2",
            i > 0 && "border-t border-border"
          )}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Detail page skeleton — matches the new key-value row layout
 * used by TransactionDetail and TickDetailPage.
 */
export function DetailSkeleton({ rows = 8 }: { rows?: number }) {
  const widths = ['w-full max-w-xs', 'w-32', 'w-20', 'w-full max-w-sm', 'w-16', 'w-24', 'w-full max-w-md', 'w-28']
  return (
    <div className="border border-border">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className={cn(
          "flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3 px-3 py-2",
          i > 0 && "border-t border-border"
        )}>
          <Skeleton className="h-2.5 w-20 sm:w-32 shrink-0" />
          <Skeleton className={cn("h-3", widths[i % widths.length])} />
        </div>
      ))}
    </div>
  );
}
