import { useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/shared/api";
import { backendTaskSchema, mapTaskFromApi } from "../model/schemas";
import { listKeys } from "@/entities/list/api/queries";
import type { Task, TaskLifecycleStatus } from "../model/types";

const STATUS_DONE: TaskLifecycleStatus = "DONE";
const STATUS_OPEN: TaskLifecycleStatus = "OPEN";

type TaskPriority = NonNullable<Task["priority"]>;

type CreateTaskInput = {
  title: string;
  description?: string | null;
  priority?: TaskPriority | null;
  dueDate?: string | null;
  status?: TaskLifecycleStatus;
};

type UpdateTaskInput = Partial<{
  title: string;
  description: string | null;
  priority: TaskPriority | null;
  dueDate: string | null;
  status: TaskLifecycleStatus;
}>;

const PRIORITY_TO_API: Record<TaskPriority, "LOW" | "MEDIUM" | "HIGH"> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
};

function buildTaskPayload(data: {
  title?: string;
  description?: string | null;
  priority?: TaskPriority | null;
  dueDate?: string | null;
  status?: TaskLifecycleStatus;
}) {
  const payload: Record<string, unknown> = {};

  if (data.title !== undefined) {
    payload.title = data.title;
  }
  if (data.description !== undefined) {
    payload.notes = data.description || null;
  }
  if (data.priority !== undefined) {
    payload.priority = data.priority ? PRIORITY_TO_API[data.priority] : null;
  }
  if (data.dueDate !== undefined) {
    payload.dueDate = data.dueDate || null;
  }
  if (data.status !== undefined) {
    payload.status = data.status;
  }

  return payload;
}

/**
 * Create a new task
 */
export async function createTask(listId: string, data: CreateTaskInput): Promise<Task> {
  const payload = buildTaskPayload({
    ...data,
    status: data.status ?? STATUS_OPEN,
  });
  // ensure title is always present
  payload.title = data.title;

  const response = await http(`/api/v1/lists/${listId}/tasks`, {
    method: "POST",
    json: payload,
  });
  const parsed = backendTaskSchema.parse(response);
  return mapTaskFromApi(parsed, listId);
}

/**
 * Hook to create a task
 */
export function useCreateTask(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskInput) => createTask(listId, data),
    onSuccess: () => {
      // Invalidate all task queries for this list (exact: false)
      // This is necessary because a new task can appear in multiple filtered views
      queryClient.invalidateQueries({
        queryKey: listKeys.tasks(listId),
        exact: false,
        refetchType: "active", // Only refetch active queries, not inactive ones
      });
    },
  });
}

/**
 * Update a task (partial)
 */
export async function updateTask(
  listId: string,
  taskId: string,
  data: UpdateTaskInput
): Promise<void> {
  const payload = buildTaskPayload(data);
  if (Object.keys(payload).length === 0) return;

  await http(`/api/v1/lists/${listId}/tasks/${taskId}`, {
    method: "PATCH",
    json: payload,
  });
}

/**
 * Hook to update a task
 */
export function useUpdateTask(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: UpdateTaskInput }) =>
      updateTask(listId, taskId, data),
    onSuccess: () => {
      // Invalidate all task queries for this list (exact: false)
      // This is necessary because updated task can affect multiple filtered views
      queryClient.invalidateQueries({
        queryKey: listKeys.tasks(listId),
        exact: false,
        refetchType: "active", // Only refetch active queries, not inactive ones
      });
    },
  });
}

/**
 * Toggle task completion status
 */
export async function toggleTask(
  listId: string,
  taskId: string,
  completed: boolean
): Promise<void> {
  const nextStatus = completed ? STATUS_DONE : STATUS_OPEN;
  await http(`/api/v1/lists/${listId}/tasks/${taskId}`, {
    method: "PATCH",
    json: { status: nextStatus },
  });
}

/**
 * Hook to toggle task completion
 */
export function useToggleTask(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) =>
      toggleTask(listId, taskId, completed),
    onMutate: async ({ taskId, completed }) => {
      // Cancel any outgoing refetches to prevent optimistic update from being overwritten
      await queryClient.cancelQueries({ queryKey: listKeys.tasks(listId) });

      const previousTasks = queryClient.getQueryData<Task[]>(listKeys.tasks(listId));

      // Optimistically update all task queries for this list
      queryClient.setQueryData<Task[]>(listKeys.tasks(listId), (old) =>
        old?.map((task) =>
          task.id === taskId
            ? { ...task, completed, status: completed ? STATUS_DONE : STATUS_OPEN }
            : task
        )
      );

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(listKeys.tasks(listId), context.previousTasks);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency with server
      queryClient.invalidateQueries({
        queryKey: listKeys.tasks(listId),
        exact: false,
        refetchType: "active", // Only refetch active queries, not inactive ones
      });
    },
  });
}

/**
 * Delete a task
 */
export async function deleteTask(listId: string, taskId: string): Promise<void> {
  await http(`/api/v1/lists/${listId}/tasks/${taskId}`, {
    method: "DELETE",
  });
}

/**
 * Hook to delete a task
 */
export function useDeleteTask(listId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(listId, taskId),
    onMutate: async (taskId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: listKeys.tasks(listId) });

      const previousTasks = queryClient.getQueryData<Task[]>(listKeys.tasks(listId));

      // Optimistically remove task from cache
      queryClient.setQueryData<Task[]>(listKeys.tasks(listId), (old) =>
        old?.filter((task) => task.id !== taskId)
      );

      return { previousTasks };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(listKeys.tasks(listId), context.previousTasks);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency with server
      queryClient.invalidateQueries({
        queryKey: listKeys.tasks(listId),
        exact: false,
        refetchType: "active", // Only refetch active queries, not inactive ones
      });
    },
  });
}
