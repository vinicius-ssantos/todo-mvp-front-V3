import { z } from "zod";
import { backendTaskSchema } from "@/entities/task/model/schemas";

/**
 * Zod schemas for List entity validation
 */
export const listSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  tasks: z.array(backendTaskSchema).optional(),
});

export const listDetailSchema = listSchema.extend({
  tasks: z.array(backendTaskSchema),
});

export const listsResponseSchema = z.array(listSchema);

export const createListSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
});

export const updateListSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo").optional(),
});
