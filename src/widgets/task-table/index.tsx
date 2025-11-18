"use client";

import { useMemo } from "react";
import { useListTasks } from "@/entities/task/api/queries";
import { useTaskHandlers } from "@/entities/task/model/useTaskHandlers";
import { TaskRow } from "@/entities/task/ui/TaskRow";
import { TaskTableSkeleton } from "@/entities/task/ui/TaskRowSkeleton";
import { CreateTaskForm } from "@/features/create-task/ui/CreateTaskForm";
import { CheckCircle2 } from "lucide-react";
import type { Task, TaskStatus } from "@/entities/task/model/types";

interface TaskTableProps {
  listId: string;
  date?: "all" | "today" | "week" | "overdue";
  status?: TaskStatus;
  search?: string;
}

/**
 * Widget to display and manage tasks for a list
 *
 * All filtering (date, status, search) is handled server-side via API.
 */
export function TaskTable({ listId, date = "all", status = "all", search = "" }: TaskTableProps) {
  const { data: tasks, isLoading, error } = useListTasks(listId, { date, status, search });
  const { handleToggle, handleDelete } = useTaskHandlers(listId);

  // Separate tasks by completion status for display
  const { pendingTasks, completedTasks } = useMemo(() => {
    if (!tasks) return { pendingTasks: [], completedTasks: [] };
    return {
      pendingTasks: tasks.filter((t) => !t.completed),
      completedTasks: tasks.filter((t) => t.completed),
    };
  }, [tasks]);

  if (isLoading) {
    return <TaskTableSkeleton count={5} />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Erro ao carregar tarefas</p>
      </div>
    );
  }

  const hasNoTasks = tasks && tasks.length === 0;

  return (
    <div className="space-y-6">
      <CreateTaskForm listId={listId} />

      {hasNoTasks ? (
        <div className="p-12 text-center text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhuma tarefa encontrada</p>
          <p className="text-sm mt-1">
            {date !== "all" || status !== "all" || search
              ? "Tente ajustar os filtros de busca."
              : "Adicione sua primeira tarefa acima!"}
          </p>
        </div>
      ) : (
        <>
          {pendingTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Pendentes ({pendingTasks.length})
              </h3>
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    listId={listId}
                    task={task}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Concluídas ({completedTasks.length})
              </h3>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    listId={listId}
                    task={task}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
