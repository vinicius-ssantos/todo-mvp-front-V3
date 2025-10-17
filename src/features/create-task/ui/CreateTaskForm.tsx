"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus } from "lucide-react"
import { Button, Input, toast } from "@/shared/ui"
import { useCreateTask } from "@/entities/task/api/mutations"
import { ApiError } from "@/shared/api"

const createTaskFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
})

type CreateTaskForm = z.infer<typeof createTaskFormSchema>

interface CreateTaskFormProps {
  listId: string
}

/**
 * Inline form to create a new task
 */
export function CreateTaskForm({ listId }: CreateTaskFormProps) {
  const createTask = useCreateTask(listId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskFormSchema),
  })

  const onSubmit = async (data: CreateTaskForm) => {
    try {
      await createTask.mutateAsync(data)
      toast.success("Tarefa criada com sucesso!")
      reset()
    } catch (error) {
      const message = error instanceof ApiError ? error.getUserMessage() : "Erro ao criar tarefa"
      toast.error(message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
      <div className="flex-1">
        <Input placeholder="Nova tarefa..." {...register("title")} />
        {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
      </div>
      <Button type="submit" size="sm" disabled={createTask.isPending} className="gap-2">
        <Plus className="h-4 w-4" />
        {createTask.isPending ? "Criando..." : "Adicionar"}
      </Button>
    </form>
  )
}
