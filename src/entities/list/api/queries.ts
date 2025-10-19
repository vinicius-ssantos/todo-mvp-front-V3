import { useQuery } from "@tanstack/react-query"
import { http } from "@/shared/api"
import { listsResponseSchema, listDetailSchema } from "../model/schemas"
import { mapTaskFromApi } from "@/entities/task/model/schemas"
import type { List, ListDetail } from "../model/types"

/**
 * Query keys for lists
 */
export const listKeys = {
  all: ["lists"] as const,
  detail: (id: string) => ["list", id] as const,
  tasks: (id: string) => ["list", id, "tasks"] as const,
}

const STATUS_DONE = "DONE"

function computeCounts(tasks?: { status: string }[]) {
  if (!tasks || tasks.length === 0) return undefined
  const total = tasks.length
  const completed = tasks.filter((task) => task.status === STATUS_DONE).length
  return {
    total,
    completed,
    pending: total - completed,
  }
}

/**
 * Fetch all lists
 */
export async function getLists(): Promise<List[]> {
  const data = await http("/api/lists")
  const parsed = listsResponseSchema.parse(data)

  return parsed.map((list) => ({
    id: list.id,
    name: list.name,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
    counts: computeCounts(list.tasks),
  }))
}

/**
 * Hook to fetch all lists
 */
export function useLists() {
  return useQuery({
    queryKey: listKeys.all,
    queryFn: getLists,
  })
}

/**
 * Fetch single list detail
 */
export async function getListDetail(id: string): Promise<ListDetail> {
  const data = await http(`/api/lists/${id}`)
  const parsed = listDetailSchema.parse(data)
  const tasks = parsed.tasks.map((task) => mapTaskFromApi(task, id))
  const completed = tasks.filter((task) => task.status === STATUS_DONE).length
  const total = tasks.length

  return {
    id: parsed.id,
    name: parsed.name,
    createdAt: parsed.createdAt,
    updatedAt: parsed.updatedAt,
    counts: total
      ? {
          total,
          completed,
          pending: total - completed,
        }
      : undefined,
    tasks,
  }
}

/**
 * Hook to fetch list detail
 */
export function useListDetail(id: string) {
  return useQuery({
    queryKey: listKeys.detail(id),
    queryFn: () => getListDetail(id),
    enabled: !!id,
  })
}
