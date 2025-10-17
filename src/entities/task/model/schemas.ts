import { z } from "zod"

/**
 * Zod schemas for Task entity validation
 */
export const taskPrioritySchema = z.enum(["low", "medium", "high"])

export const taskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  description: z.string().optional(),
  completed: z.boolean(),
  listId: z.string().uuid(),
  priority: taskPrioritySchema.optional(),
  dueDate: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const tasksResponseSchema = z.array(taskSchema)

export const createTaskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo"),
  description: z.string().optional(),
  priority: taskPrioritySchema.optional(),
  dueDate: z.string().datetime().optional(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200, "Título muito longo").optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  priority: taskPrioritySchema.optional(),
  dueDate: z.string().datetime().optional(),
})
