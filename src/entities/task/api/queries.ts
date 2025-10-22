import { useQuery } from "@tanstack/react-query"
import { z } from "zod"
import { http } from "@/shared/api"
import { backendTaskSchema, mapTaskFromApi } from "../model/schemas"
import { listKeys } from "@/entities/list/api/queries"
import type { Task } from "../model/types"

export type TaskFilters = { date?: "all" | "today" | "week" | "overdue"; status?: "all" | "pending" | "completed"; search?: string }

const listTasksResponseSchema = z.object({
  id: z.string().uuid(),
  tasks: z.array(backendTaskSchema).default([]),
})

const mapFiltersToParams = (f: TaskFilters) => {
  const qs = new URLSearchParams()
  if (f.date && f.date !== "all") qs.set("due", f.date)
  if (f.status && f.status !== "all") qs.set("status", f.status === "pending" ? "OPEN" : "DONE")
  if (f.search?.trim()) qs.set("q", f.search.trim())
  const s = qs.toString()
  return s ? `?${s}` : ""
}

async function getListTasks(listId: string, filters: TaskFilters = {}) {
  const url = `/api/lists/${listId}/tasks${mapFiltersToParams(filters)}`
  const raw = await http(url)
  const parsed = listTasksResponseSchema.parse(raw)
  return parsed.tasks.map(mapTaskFromApi)
}


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
export function useListTasks(listId: string, filters: TaskFilters = {}) {
    const { date = "all", status = "all", search = "" } = filters
    return useQuery({
        queryKey: [...listKeys.tasks(listId), "date", date, "status", status, "search", search],
        queryFn: () => getListTasks(listId, filters),
        enabled: !!listId,
    })
}
