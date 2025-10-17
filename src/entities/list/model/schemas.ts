import { z } from "zod"

/**
 * Zod schemas for List entity validation
 */
export const listCountsSchema = z.object({
  total: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
})

export const listSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  counts: listCountsSchema.optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const listDetailSchema = listSchema.extend({
  description: z.string().optional(),
})

export const listsResponseSchema = z.array(listSchema)

export const createListSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  description: z.string().optional(),
})

export const updateListSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo").optional(),
  description: z.string().optional(),
})
