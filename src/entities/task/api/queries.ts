import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { http } from "@/shared/api"
import { backendTaskSchema, mapTaskFromApi } from "../model/schemas"
import { listKeys } from "@/entities/list/api/queries"
import type { Task } from "../model/types"

type TaskFilters = { date?: "all" | "today" | "week" | "overdue" }

const listTasksResponseSchema = z.object({
  id: z.string().uuid(),
  tasks: z.array(backendTaskSchema).default([]),
})

/**
 * Fetch tasks for a list
 */


export async function getListTasks(listId: string, filters?: TaskFilters): Promise<Task[]> {
    // por enquanto, mantém a mesma chamada
    const data = await http(`/api/lists/${listId}`)
    const parsed = listTasksResponseSchema.parse(data)
    const tasks = parsed.tasks.map((t) => mapTaskFromApi(t, listId))

    // sem filtrar ainda — próxima etapa a gente liga ?due=... no endpoint
    return tasks
}


/**
 * Hook to fetch tasks for a list
 */
export function useListTasks(listId: string,filters: TaskFilters = {}) {
    const { date = "all" } = filters
    return useQuery({
        queryKey: listKeys.tasks(listId).concat(["date", date]),
        queryFn: () => getListTasks(listId, filters),
        enabled: !!listId,
    })
}
