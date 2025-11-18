import { useMutation, useQueryClient } from "@tanstack/react-query";
import { http, ApiError } from "@/shared/api";
import { env } from "@/shared/env";
import { listSchema } from "../model/schemas";
import { listKeys } from "./queries";
import type { List, ListDetail } from "../model/types";

/**
 * Create a new list
 */
export async function createList(name: string): Promise<List> {
  const data = await http("/api/lists", {
    method: "POST",
    json: { name },
  });
  return listSchema.parse(data);
}

/**
 * Hook to create a list
 */
export function useCreateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createList,
    onSuccess: () => {
      // Invalidate lists query to refetch
      queryClient.invalidateQueries({ queryKey: listKeys.all });
    },
  });
}

/**
 * Rename a list (tries PUT first, falls back to PATCH if needed)
 */
export async function renameList(id: string, name: string): Promise<void> {
  const usePatch = env.NEXT_PUBLIC_USE_PATCH;

  try {
    // Try PUT first (unless explicitly configured to use PATCH)
    const method = usePatch ? "PATCH" : "PUT";
    await http(`/api/lists/${id}`, {
      method,
      json: { name },
    });
  } catch (error) {
    // If PUT fails with 405 (Method Not Allowed), try PATCH
    if (error instanceof ApiError && error.status === 405 && !usePatch) {
      console.log("[Rename List] PUT not supported, falling back to PATCH");
      await http(`/api/lists/${id}`, {
        method: "PATCH",
        json: { name },
      });
    }
    throw error;
  }
}

/**
 * Hook to rename a list with optimistic updates
 */
export function useRenameList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameList(id, name),
    onMutate: async ({ id, name }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: listKeys.all });
      await queryClient.cancelQueries({ queryKey: listKeys.detail(id) });

      // Snapshot previous values
      const previousLists = queryClient.getQueryData(listKeys.all);
      const previousDetail = queryClient.getQueryData<ListDetail | undefined>(listKeys.detail(id));

      // Optimistically update lists
      queryClient.setQueryData<List[]>(listKeys.all, (old) =>
        old?.map((list) => (list.id === id ? { ...list, name } : list))
      );

      // Optimistically update detail
      queryClient.setQueryData<ListDetail | undefined>(listKeys.detail(id), (old) =>
        old ? { ...old, name } : old
      );

      return { previousLists, previousDetail };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousLists) {
        queryClient.setQueryData(listKeys.all, context.previousLists);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(listKeys.detail(id), context.previousDetail);
      }
    },
    onSettled: (data, error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: listKeys.all });
      queryClient.invalidateQueries({ queryKey: listKeys.detail(id) });
    },
  });
}

/**
 * Delete a list
 */
export async function deleteList(id: string): Promise<void> {
  await http(`/api/lists/${id}`, {
    method: "DELETE",
  });
}

/**
 * Hook to delete a list
 */
export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listKeys.all });
    },
  });
}
