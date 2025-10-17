"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/shared/ui"
import { Trash2 } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import type { Task } from "../model/types"

interface TaskRowProps {
  task: Task
  onToggle: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
}

/**
 * Task row component for displaying a single task
 */
export function TaskRow({ task, onToggle, onDelete }: TaskRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:bg-accent/50 transition-colors">
      <Checkbox checked={task.completed} onCheckedChange={(checked) => onToggle(task.id, checked as boolean)} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", task.completed && "line-through text-muted-foreground")}>
          {task.title}
        </p>
        {task.description && <p className="text-xs text-muted-foreground mt-1 truncate">{task.description}</p>}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(task.id)}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
