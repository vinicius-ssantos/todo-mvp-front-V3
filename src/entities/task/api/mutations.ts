import { useMutation, useQueryClient } from "@tanstack/react-query"
import { http } from "@/shared/api"
import { backendTaskSchema, mapTaskFromApi } from "../model/schemas"
import { listKeys } from "@/entities/list/api/queries"
import type { Task } from "../model/types"

const STATUS_DONE = "DONE"
const STATUS_OPEN = "OPEN"

/**
 * Create a new task
 */
export async function createTask(listId: string, data: { title: string }): Promise<Task> {
  const response = await http(`/api/lists/${listId}/tasks`, {
    method: "POST",
    json: { title: data.title, status: STATUS_OPEN },
  })
  const parsed = backendTaskSchema.parse(response)
  return mapTaskFromApi(parsed, listId)
}

/**
 * Hook to create a task
 */
export function useCreateTask(listId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { title: string }) => createTask(listId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.tasks(listId) })
      queryClient.invalidateQueries({ queryKey: listKeys.all })
    },
  })
}

/**
 * Toggle task completion status
 */
export async function toggleTask(listId: string, taskId: string, completed: boolean): Promise<void> {
  const nextStatus = completed ? STATUS_DONE : STATUS_OPEN
  await http(`/api/lists/${listId}/tasks/${taskId}`, {
    method: "PATCH",
    json: { status: nextStatus },
  })
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
      await queryClient.cancelQueries({ queryKey: listKeys.tasks(listId) })

      const previousTasks = queryClient.getQueryData<Task[]>(listKeys.tasks(listId))

      queryClient.setQueryData<Task[]>(listKeys.tasks(listId), (old) =>
        old?.map((task) =>
          task.id === taskId
            ? { ...task, completed, status: completed ? STATUS_DONE : STATUS_OPEN }
            : task,
        ),
      )

      return { previousTasks }
    },
    onError: (_err, _variables, context) => {
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
