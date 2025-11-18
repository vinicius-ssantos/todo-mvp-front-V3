import { useToggleTask, useDeleteTask } from "../api/mutations";
import { toast } from "@/shared/ui";
import { ApiError } from "@/shared/api";

/**
 * Custom hook that encapsulates task mutation handlers
 *
 * Provides standardized handlers for common task operations:
 * - Toggle task completion status
 * - Delete task
 *
 * Includes:
 * - Error handling with user-friendly messages
 * - Success toast notifications
 * - ApiError detection and message extraction
 *
 * @param listId - The ID of the list containing the tasks
 * @returns Object with handleToggle and handleDelete functions
 *
 * @example
 * ```tsx
 * function TaskTable({ listId }: { listId: string }) {
 *   const { handleToggle, handleDelete } = useTaskHandlers(listId)
 *
 *   return (
 *     <TaskRow
 *       onToggle={handleToggle}
 *       onDelete={handleDelete}
 *     />
 *   )
 * }
 * ```
 */
export function useTaskHandlers(listId: string) {
  const toggleTask = useToggleTask(listId);
  const deleteTask = useDeleteTask(listId);

  /**
   * Handles toggling a task's completion status
   *
   * @param taskId - The ID of the task to toggle
   * @param completed - The new completion status
   */
  const handleToggle = async (taskId: string, completed: boolean) => {
    try {
      await toggleTask.mutateAsync({ taskId, completed });
      // Success is silent (optimistic update already happened)
    } catch (error) {
      const message =
        error instanceof ApiError ? error.getUserMessage() : "Erro ao atualizar tarefa";
      toast.error(message);
    }
  };

  /**
   * Handles deleting a task
   *
   * @param taskId - The ID of the task to delete
   */
  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success("Tarefa excluída com sucesso!");
    } catch (error) {
      const message = error instanceof ApiError ? error.getUserMessage() : "Erro ao excluir tarefa";
      toast.error(message);
    }
  };

  return {
    handleToggle,
    handleDelete,
    // Expose mutation states for loading indicators if needed
    isTogglingTask: toggleTask.isPending,
    isDeletingTask: deleteTask.isPending,
  };
}
