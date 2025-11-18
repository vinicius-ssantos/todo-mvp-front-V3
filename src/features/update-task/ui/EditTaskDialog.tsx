"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  toast,
} from "@/shared/ui";
import { ApiError } from "@/shared/api";
import { useUpdateTask } from "@/entities/task/api/mutations";
import type { Task, TaskLifecycleStatus } from "@/entities/task/model/types";
import { Pencil } from "lucide-react";
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "@/shared/constants/task-options";

const editTaskFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  description: z.string().max(1000, "Descrição muito longa").optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional().or(z.literal("")),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE", "BLOCKED", "ARCHIVED"]),
});

type EditTaskForm = z.infer<typeof editTaskFormSchema>;

interface EditTaskDialogProps {
  listId: string;
  task: Task;
}

function toDateInputValue(value?: string) {
  if (!value) return "";
  try {
    return value.slice(0, 10);
  } catch {
    return "";
  }
}

/**
 * Dialog to edit a task's full details.
 */
export function EditTaskDialog({ listId, task }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const updateTask = useUpdateTask(listId);

  const defaultValues = useMemo<EditTaskForm>(
    () => ({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority ?? "medium",
      dueDate: toDateInputValue(task.dueDate),
      status: task.status,
    }),
    [task]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<EditTaskForm>({
    resolver: zodResolver(editTaskFormSchema),
    defaultValues,
  });

  const priorityValue = watch("priority");
  const statusValue = watch("status");

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const onSubmit = async (data: EditTaskForm) => {
    const payload = {
      title: data.title.trim(),
      description: data.description?.trim() ? data.description.trim() : null,
      priority: data.priority as Task["priority"],
      dueDate: data.dueDate ? data.dueDate : null,
      status: data.status,
    };

    try {
      await updateTask.mutateAsync({ taskId: task.id, data: payload });
      toast.success("Tarefa atualizada!");
      setOpen(false);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.getUserMessage() : "Erro ao atualizar tarefa";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Título</Label>
            <Input id="task-title" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">Notas</Label>
            <Textarea
              id="task-description"
              rows={4}
              placeholder="Detalhes adicionais..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={priorityValue}
                onValueChange={(value) =>
                  setValue("priority", value as EditTaskForm["priority"], { shouldDirty: true })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-destructive">{errors.priority.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-dueDate">Entrega</Label>
              <Input id="task-dueDate" type="date" {...register("dueDate")} />
              {errors.dueDate && (
                <p className="text-sm text-destructive">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={statusValue}
              onValueChange={(value) =>
                setValue("status", value as TaskLifecycleStatus, { shouldDirty: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || updateTask.isPending}>
              {updateTask.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
