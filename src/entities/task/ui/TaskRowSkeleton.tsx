import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for TaskRow component
 */
export function TaskRowSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
      {/* Checkbox skeleton */}
      <Skeleton className="h-5 w-5 mt-1 shrink-0 rounded" />

      <div className="flex-1 min-w-0 space-y-2">
        {/* Title and description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex shrink-0 items-center gap-1">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  );
}

/**
 * Multiple skeleton rows for loading state
 */
export function TaskTableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {/* Create task form skeleton */}
      <div className="rounded-lg border border-border bg-card p-4">
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Pending tasks section */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2">
          {Array.from({ length: count }).map((_, i) => (
            <TaskRowSkeleton key={`pending-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
