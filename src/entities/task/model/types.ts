/**
 * Task entity types
 */
export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  listId: string
  priority?: "low" | "medium" | "high"
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export type TaskStatus = "all" | "pending" | "completed"
