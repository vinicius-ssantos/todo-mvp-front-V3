import { Badge } from "@/shared/ui";
import type { List } from "../model/types";

interface ListBadgeProps {
  list: List;
  variant?: "default" | "secondary" | "outline";
}

/**
 * Badge component to display list with task counts
 */
export function ListBadge({ list, variant = "secondary" }: ListBadgeProps) {
  return (
    <Badge variant={variant} className="gap-2">
      <span>{list.name}</span>
      {list.counts && (
        <span className="text-muted-foreground">
          {list.counts.completed}/{list.counts.total}
        </span>
      )}
    </Badge>
  );
}
