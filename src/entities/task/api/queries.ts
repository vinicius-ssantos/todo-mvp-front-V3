import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { http } from "@/shared/api"
import { backendTaskSchema, mapTaskFromApi } from "../model/schemas"
import { listKeys } from "@/entities/list/api/queries"
import type { Task } from "../model/types"

const listTasksResponseSchema = z.object({
  id: z.string().uuid(),
  tasks: z.array(backendTaskSchema).default([]),
})

/**
 * Fetch tasks for a list
 */
export async function getListTasks(listId: string): Promise<Task[]> {
  const data = await http(`/api/lists/${listId}`)
  const parsed = listTasksResponseSchema.parse(data)
  return parsed.tasks.map((task) => mapTaskFromApi(task, listId))
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
