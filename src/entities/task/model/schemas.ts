import { z } from "zod"
import type { Task } from "./types"

/**
 * Zod schemas for Task entity validation
 */
export const taskPrioritySchema = z.enum(["low", "medium", "high"])
export const taskStatusSchema = z.enum(["OPEN", "IN_PROGRESS", "DONE", "BLOCKED", "ARCHIVED"])
export const backendTaskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH"])

export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  description: z.string().optional(),
  completed: z.boolean(),
  status: taskStatusSchema,
  listId: z.string().uuid(),
  priority: taskPrioritySchema.optional(),
  dueDate: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const backendTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  notes: z.string().nullable().optional(),
  priority: backendTaskPrioritySchema.nullish(),
  status: taskStatusSchema,
  dueDate: z.string().nullable().optional(),
  position: z.number().int().nonnegative().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type BackendTask = z.infer<typeof backendTaskSchema>

export function mapTaskFromApi(task: BackendTask, listId: string): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.notes ?? undefined,
    completed: task.status === "DONE",
    status: task.status,
    listId,
    priority: task.priority ? task.priority.toLowerCase() as "low" | "medium" | "high" : undefined,
    dueDate: task.dueDate ?? undefined,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }
}

export const createTaskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo").optional(),
  status: taskStatusSchema.optional(),
})
