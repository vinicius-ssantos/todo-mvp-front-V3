import { useQuery } from "@tanstack/react-query"
import { http } from "@/shared/api"
import { listsResponseSchema, listDetailSchema } from "../model/schemas"
import type { List, ListDetail } from "../model/types"

/**
 * Query keys for lists
 */
export const listKeys = {
  all: ["lists"] as const,
  detail: (id: string) => ["list", id] as const,
  tasks: (id: string) => ["list", id, "tasks"] as const,
}

/**
 * Fetch all lists
 */
export async function getLists(): Promise<List[]> {
  const data = await http("/api/lists")
  return listsResponseSchema.parse(data)
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
  return listDetailSchema.parse(data)
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
