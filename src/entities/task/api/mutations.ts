import { useMutation, useQueryClient } from "@tanstack/react-query"
import { http } from "@/shared/api"
import { taskSchema } from "../model/schemas"
import { listKeys } from "@/entities/list/api/queries"
import type { Task } from "../model/types"

/**
 * Create a new task
 */
export async function createTask(listId: string, data: { title: string; description?: string }): Promise<Task> {
  const response = await http(`/api/lists/${listId}/tasks`, {
    method: "POST",
    json: data,
  })
  return taskSchema.parse(response)
}

/**
 * Hook to create a task
 */
export function useCreateTask(listId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { title: string; description?: string }) => createTask(listId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.tasks(listId) })
      queryClient.invalidateQueries({ queryKey: listKeys.all })
    },
  })
}

/**
 * Toggle task completion status
 */
export async function toggleTask(listId: string, taskId: string, completed: boolean): Promise<Task> {
  const data = await http(`/api/lists/${listId}/tasks/${taskId}`, {
    method: "PATCH",
    json: { completed },
  })
  return taskSchema.parse(data)
}

/**
 * Hook to toggle task completion
 */
export function useToggleTask(listId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) =>
      toggleTask(listId, taskId, completed),
    onMutate: async ({ taskId, completed }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: listKeys.tasks(listId) })

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(listKeys.tasks(listId))

      // Optimistically update
      queryClient.setQueryData<Task[]>(listKeys.tasks(listId), (old) =>
        old?.map((task) => (task.id === taskId ? { ...task, completed } : task)),
      )

      return { previousTasks }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(listKeys.tasks(listId), context.previousTasks)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.tasks(listId) })
      queryClient.invalidateQueries({ queryKey: listKeys.all })
    },
  })
}

/**
 * Delete a task
 */
export async function deleteTask(listId: string, taskId: string): Promise<void> {
  await http(`/api/lists/${listId}/tasks/${taskId}`, {
    method: "DELETE",
  })
}

/**
 * Hook to delete a task
 */
export function useDeleteTask(listId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(listId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.tasks(listId) })
      queryClient.invalidateQueries({ queryKey: listKeys.all })
    },
  })
}
