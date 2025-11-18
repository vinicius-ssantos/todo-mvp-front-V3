"use client";

import { useMemo } from "react";
import { useListTasks } from "@/entities/task/api/queries";
import { useTaskHandlers } from "@/entities/task/model/useTaskHandlers";
import { TaskRow } from "@/entities/task/ui/TaskRow";
import { CreateTaskForm } from "@/features/create-task/ui/CreateTaskForm";
import { Spinner } from "@/shared/ui";
import { CheckCircle2 } from "lucide-react";
import type { Task, TaskStatus } from "@/entities/task/model/types";

interface TaskTableProps {
  listId: string;
  date?: "all" | "today" | "week" | "overdue";
  status?: TaskStatus;
  search?: string;
}

/**
 * Filters tasks based on status and search query
 */
function filterTasks(tasks: Task[], status: TaskStatus, search: string): Task[] {
  let filtered = tasks;

  // Filter by status
  if (status === "pending") {
    filtered = filtered.filter((t) => !t.completed);
  } else if (status === "completed") {
    filtered = filtered.filter((t) => t.completed);
  }
  // "all" shows both pending and completed

  // Filter by search query
  if (search.trim()) {
    const query = search.toLowerCase().trim();
    filtered = filtered.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(query);
      const descriptionMatch = task.description?.toLowerCase().includes(query) || false;
      return titleMatch || descriptionMatch;
    });
  }

  return filtered;
}

/**
 * Widget to display and manage tasks for a list
 *
 * Supports client-side filtering by status and search query.
 */
export function TaskTable({ listId, date = "all", status = "all", search = "" }: TaskTableProps) {
  const { data: tasks, isLoading, error } = useListTasks(listId, { date });
  const { handleToggle, handleDelete } = useTaskHandlers(listId);

  // Apply client-side filters
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return filterTasks(tasks, status, search);
  }, [tasks, status, search]);

  const pendingTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Erro ao carregar tarefas</p>
      </div>
    );
  }

  const hasNoTasks = tasks && tasks.length === 0;
  const hasNoFilteredTasks = filteredTasks.length === 0 && tasks && tasks.length > 0;

  return (
    <div className="space-y-6">
      <CreateTaskForm listId={listId} />

      {hasNoTasks ? (
        <div className="p-12 text-center text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhuma tarefa ainda</p>
          <p className="text-sm mt-1">Adicione sua primeira tarefa acima!</p>
        </div>
      ) : hasNoFilteredTasks ? (
        <div className="p-12 text-center text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhuma tarefa encontrada</p>
          <p className="text-sm mt-1">Tente ajustar os filtros de busca.</p>
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
