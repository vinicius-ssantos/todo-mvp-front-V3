"use client"

import { useListTasks } from "@/entities/task/api/queries"
import { useToggleTask, useDeleteTask } from "@/entities/task/api/mutations"
import { TaskRow } from "@/entities/task/ui/TaskRow"
import { CreateTaskForm } from "@/features/create-task/ui/CreateTaskForm"
import { Spinner, toast } from "@/shared/ui"
import { ApiError } from "@/shared/api"
import { CheckCircle2 } from "lucide-react"

interface TaskTableProps {
  listId: string
}

/**
 * Widget to display and manage tasks for a list
 */
export function TaskTable({ listId }: TaskTableProps) {
  const { data: tasks, isLoading, error } = useListTasks(listId)
  const toggleTask = useToggleTask(listId)
  const deleteTask = useDeleteTask(listId)

  const handleToggle = async (taskId: string, completed: boolean) => {
    try {
      await toggleTask.mutateAsync({ taskId, completed })
    } catch (error) {
      const message = error instanceof ApiError ? error.getUserMessage() : "Erro ao atualizar tarefa"
      toast.error(message)
    }
  }

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync(taskId)
      toast.success("Tarefa excluída com sucesso!")
    } catch (error) {
      const message = error instanceof ApiError ? error.getUserMessage() : "Erro ao excluir tarefa"
      toast.error(message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Erro ao carregar tarefas</p>
      </div>
    )
  }

  const pendingTasks = tasks?.filter((t) => !t.completed) || []
  const completedTasks = tasks?.filter((t) => t.completed) || []

  return (
    <div className="space-y-6">
      <CreateTaskForm listId={listId} />

      {tasks && tasks.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhuma tarefa ainda</p>
          <p className="text-sm mt-1">Adicione sua primeira tarefa acima!</p>
        </div>
      ) : (
        <>
          {pendingTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Pendentes ({pendingTasks.length})
              </h3>
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <TaskRow key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Concluídas ({completedTasks.length})
              </h3>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskRow key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
