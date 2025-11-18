"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Badge, Button } from "@/shared/ui";
import { CalendarCheck, Flag, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { format, isPast, parseISO } from "date-fns";
import type { Task } from "../model/types";
import { EditTaskDialog } from "@/features/update-task/ui/EditTaskDialog";

const STATUS_LABELS: Record<Task["status"], string> = {
  OPEN: "Aberta",
  IN_PROGRESS: "Em progresso",
  DONE: "Concluída",
  BLOCKED: "Bloqueada",
  ARCHIVED: "Arquivada",
};

const PRIORITY_LABELS: Record<NonNullable<Task["priority"]>, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const PRIORITY_STYLES: Record<NonNullable<Task["priority"]>, string> = {
  low: "bg-priority-low text-priority-low-foreground",
  medium: "bg-priority-medium text-priority-medium-foreground",
  high: "bg-priority-high text-priority-high-foreground",
};

interface TaskRowProps {
  listId: string;
  task: Task;
  onToggle: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
}

/**
 * Task row component for displaying a single task with metadata.
 */
export function TaskRow({ listId, task, onToggle, onDelete }: TaskRowProps) {
  const dueDate = task.dueDate ? parseISO(task.dueDate) : null;
  const overdue = dueDate ? isPast(dueDate) && !task.completed : false;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Toggle task with Space or Enter key
    if (e.key === " " || e.key === "Enter") {
      if ((e.target as HTMLElement).tagName !== "BUTTON") {
        e.preventDefault();
        onToggle(task.id, !task.completed);
      }
    }
  };

  return (
    <div
      role="article"
      aria-label={`Tarefa: ${task.title}${task.completed ? ", concluída" : ", pendente"}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) => onToggle(task.id, checked as boolean)}
        aria-label={`Marcar ${task.title} como ${task.completed ? "pendente" : "concluída"}`}
        className="mt-1"
      />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={cn(
                "text-sm font-medium",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="mt-1 text-xs text-muted-foreground">{task.description}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <EditTaskDialog listId={listId} task={task} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="text-destructive hover:text-destructive"
              aria-label={`Excluir tarefa ${task.title}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="border-transparent bg-muted text-muted-foreground">
            {STATUS_LABELS[task.status]}
          </Badge>

          {task.priority && (
            <Badge
              variant="outline"
              className={cn("border-transparent gap-1", PRIORITY_STYLES[task.priority])}
            >
              <Flag className="h-3 w-3" />
              {PRIORITY_LABELS[task.priority]}
            </Badge>
          )}

          {dueDate && (
            <Badge
              variant="outline"
              className={cn(
                "border-transparent gap-1",
                overdue
                  ? "bg-priority-high text-priority-high-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <CalendarCheck className="h-3 w-3" />
              {format(dueDate, "dd/MM/yyyy")}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
