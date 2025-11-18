import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader for a single list item
 */
function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg">
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

/**
 * Skeleton loader for SidebarLists component
 */
export function SidebarListsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {Array.from({ length: count }).map((_, i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
