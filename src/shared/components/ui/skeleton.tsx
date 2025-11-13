import { cn } from "@/shared/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-neutral-800/50", className)}
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
    <div className="mobile-scroll-table">
      <div className="w-full">
        {/* Header skeleton */}
        <div className="flex border-b border-neutral-700 mb-2">
          <div className="flex-1 p-2">
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex-1 p-2">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex-1 p-2">
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex-1 p-2">
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="flex-1 p-2">
            <Skeleton className="h-4 w-18" />
          </div>
        </div>
        
        {/* Rows skeleton */}
        <div className="space-y-0">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex h-10 border-b border-neutral-800/50">
              <div className="flex-1 p-2 flex items-center">
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="flex-1 p-2 flex items-center">
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex-1 p-2 flex items-center">
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex-1 p-2 flex items-center">
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="flex-1 p-2 flex items-center justify-end">
                <Skeleton className="h-3 w-16" />
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
    <div className="mobile-scroll-table">
      <div className="w-full">
        {/* Header skeleton */}
        <div className="flex border-b border-neutral-700 mb-2">
          <div className="flex-1 p-2">
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex-1 p-2">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex-1 p-2">
            <Skeleton className="h-4 w-18" />
          </div>
        </div>
        
        {/* Rows skeleton */}
        <div className="space-y-0">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex h-10 border-b border-neutral-800/50">
              <div className="flex-1 p-2 flex items-center">
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex-1 p-2 flex items-center">
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="flex-1 p-2 flex items-center justify-end">
                <Skeleton className="h-3 w-16" />
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