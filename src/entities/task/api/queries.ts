import { useQuery } from "@tanstack/react-query"
import { http } from "@/shared/api"
import { tasksResponseSchema } from "../model/schemas"
import { listKeys } from "@/entities/list/api/queries"
import type { Task } from "../model/types"

/**
 * Fetch tasks for a list
 */
export async function getListTasks(listId: string): Promise<Task[]> {
  const data = await http(`/api/lists/${listId}/tasks`)
  return tasksResponseSchema.parse(data)
}

/**
 * Hook to fetch tasks for a list
 */
export function useListTasks(listId: string) {
  return useQuery({
    queryKey: listKeys.tasks(listId),
    queryFn: () => getListTasks(listId),
    enabled: !!listId,
  })
}
