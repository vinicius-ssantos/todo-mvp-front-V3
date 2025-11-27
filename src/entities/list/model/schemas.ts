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

export const paginatedListsResponseSchema = z.object({
  content: z.array(listSchema),
  pageable: z.object({
    pageNumber: z.number(),
    pageSize: z.number(),
    sort: z.object({
      empty: z.boolean(),
      sorted: z.boolean(),
      unsorted: z.boolean(),
    }),
    offset: z.number(),
    paged: z.boolean(),
    unpaged: z.boolean(),
  }),
  totalPages: z.number(),
  totalElements: z.number(),
  last: z.boolean(),
  size: z.number(),
  number: z.number(),
  numberOfElements: z.number(),
  sort: z.object({
    empty: z.boolean(),
    sorted: z.boolean(),
    unsorted: z.boolean(),
  }),
  first: z.boolean(),
  empty: z.boolean(),
});

export const createListSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
});

export const updateListSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo").optional(),
});
