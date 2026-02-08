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
    <div className="mobile-scroll-table">
      <div className="w-full">
        <div className="space-y-0">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex">
              <div className="h-10 bg-neutral-900/50 flex-1 border-b border-neutral-800 p-2">
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="h-10 bg-neutral-800/30 flex-1 border-b border-neutral-800 p-2">
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
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
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="animate-pulse space-y-6">
        {title && (
          <Skeleton className={cn("h-6 sm:h-8 rounded mb-4 sm:mb-6", titleWidth)} />
        )}
        {children}
      </div>
    </div>
  );
}

interface TransactionTableSkeletonProps {
  rows?: number;
}

export function TransactionTableSkeleton({ rows = 6 }: TransactionTableSkeletonProps) {
  return (
    <div className="mobile-scroll-table overflow-x-auto">
      <div className="w-full min-w-[600px]">
        {/* Header skeleton - matches TransactionsTable: Sequence #, Txn Hash, Tick #, Txn Id, Timestamp */}
        <div className="flex border-b border-neutral-700">
          <div className="min-w-[60px] md:min-w-[80px] p-2">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="min-w-[100px] md:min-w-[140px] p-2">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="min-w-[70px] md:min-w-[90px] p-2">
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex-1 p-2">
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="min-w-[70px] md:min-w-[90px] lg:min-w-[160px] p-2">
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        </div>

        {/* Rows skeleton */}
        <div className="space-y-0">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex h-10 border-b border-neutral-800/50">
              <div className="min-w-[60px] md:min-w-[80px] p-2 flex items-center">
                <Skeleton className="h-3 w-10" />
              </div>
              <div className="min-w-[100px] md:min-w-[140px] p-2 flex items-center">
                <Skeleton className="h-3 w-24 md:w-32" />
              </div>
              <div className="min-w-[70px] md:min-w-[90px] p-2 flex items-center">
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex-1 p-2 flex items-center">
                <Skeleton className="h-3 w-20 md:w-28 lg:w-40" />
              </div>
              <div className="min-w-[70px] md:min-w-[90px] lg:min-w-[160px] p-2 flex items-center justify-end">
                <Skeleton className="h-3 w-16 lg:w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface TicksTableSkeletonProps {
  rows?: number;
}

export function TicksTableSkeleton({ rows = 6 }: TicksTableSkeletonProps) {
  return (
    <div className="mobile-scroll-table w-full overflow-x-auto">
      <div className="w-full min-w-[280px]">
        {/* Header skeleton - matches TicksTable: Tick #, Tx Count, Timestamp */}
        <div className="flex border-b border-neutral-700">
          <div className="min-w-[80px] sm:min-w-32 p-2">
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex-1 p-2">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="min-w-[90px] sm:min-w-36 p-2">
            <Skeleton className="h-4 w-16 ml-auto" />
          </div>
        </div>

        {/* Rows skeleton */}
        <div className="space-y-0">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex h-10 border-b border-neutral-800/50">
              <div className="min-w-[80px] sm:min-w-32 p-2 flex items-center">
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex-1 p-2 flex items-center">
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="min-w-[90px] sm:min-w-36 p-2 flex items-center justify-end">
                <Skeleton className="h-3 w-16 sm:w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CardSkeletonProps {
  rows?: number;
}

export function CardSkeleton({ rows = 3 }: CardSkeletonProps) {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="space-y-2">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}