"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import {
  Button,
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
import { useCreateTask } from "@/entities/task/api/mutations";
import { ApiError } from "@/shared/api";
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "@/shared/constants/task-options";

const createTaskFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  description: z.string().max(1000, "Descrição muito longa").optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().optional().or(z.literal("")),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE", "BLOCKED", "ARCHIVED"]),
});

type CreateTaskFormValues = z.infer<typeof createTaskFormSchema>;

interface CreateTaskFormProps {
  listId: string;
}

/**
 * Form to create a new task with optional advanced fields.
 */
export function CreateTaskForm({ listId }: CreateTaskFormProps) {
  const createTask = useCreateTask(listId);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "OPEN",
      dueDate: "",
    },
  });

  const priorityValue = watch("priority");
  const statusValue = watch("status");

  const onSubmit = async (data: CreateTaskFormValues) => {
    try {
      await createTask.mutateAsync({
        title: data.title.trim(),
        description: data.description?.trim() ? data.description.trim() : undefined,
        priority: data.priority,
        dueDate: data.dueDate ? data.dueDate : undefined,
        status: data.status,
      });
      toast.success("Tarefa criada com sucesso!");
      // Announce to screen readers
      const announcement = document.createElement("div");
      announcement.setAttribute("role", "status");
      announcement.setAttribute("aria-live", "polite");
      announcement.className = "sr-only";
      announcement.textContent = `Tarefa ${data.title.trim()} criada com sucesso`;
      document.body.appendChild(announcement);
      setTimeout(() => document.body.removeChild(announcement), 1000);

      reset({
        title: "",
        description: "",
        priority: "medium",
        status: "OPEN",
        dueDate: "",
      });
      setShowAdvanced(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.getUserMessage() : "Erro ao criar tarefa";
      toast.error(message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit with Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={handleKeyDown}
      className="space-y-4 rounded-lg border border-border bg-card p-4"
      aria-label="Formulário para criar nova tarefa"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start">
        <div className="flex-1">
          <Label htmlFor="new-task-title" className="sr-only">
            Título
          </Label>
          <Input id="new-task-title" placeholder="Nova tarefa..." {...register("title")} />
          {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
        </div>
        <Button type="submit" size="sm" disabled={createTask.isPending} className="gap-2 md:mt-0">
          <Plus className="h-4 w-4" />
          {createTask.isPending ? "Criando..." : "Adicionar"}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Adicione detalhes como prioridade, notas ou data de entrega.
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced((prev) => !prev)}
          className="gap-1"
          aria-expanded={showAdvanced}
          aria-controls="advanced-task-options"
          aria-label={showAdvanced ? "Ocultar opções avançadas" : "Mostrar opções avançadas"}
        >
          {showAdvanced ? (
            <>
              Ocultar opções <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Mais opções <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {showAdvanced && (
        <div
          id="advanced-task-options"
          className="grid gap-4 md:grid-cols-2"
          role="region"
          aria-label="Opções avançadas"
        >
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="new-task-description">Notas</Label>
            <Textarea
              id="new-task-description"
              rows={3}
              placeholder="Descreva a tarefa, links ou checklist..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-task-priority">Prioridade</Label>
            <Select
              value={priorityValue}
              onValueChange={(value) =>
                setValue("priority", value as CreateTaskFormValues["priority"], {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger
                id="new-task-priority"
                className="w-full"
                aria-label="Selecione a prioridade"
              >
                <SelectValue />
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
            <Label htmlFor="new-task-status">Status inicial</Label>
            <Select
              value={statusValue}
              onValueChange={(value) =>
                setValue("status", value as CreateTaskFormValues["status"], { shouldDirty: true })
              }
            >
              <SelectTrigger
                id="new-task-status"
                className="w-full"
                aria-label="Selecione o status inicial"
              >
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

          <div className="space-y-2">
            <Label htmlFor="new-task-dueDate">Data de entrega</Label>
            <Input id="new-task-dueDate" type="date" {...register("dueDate")} />
            {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate.message}</p>}
          </div>
        </div>
      )}
    </form>
  );
}
