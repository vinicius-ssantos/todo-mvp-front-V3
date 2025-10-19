/**
 * Task entity types
 */
export type TaskLifecycleStatus = "OPEN" | "IN_PROGRESS" | "DONE" | "BLOCKED" | "ARCHIVED"

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  status: TaskLifecycleStatus
  listId: string
  priority?: "low" | "medium" | "high"
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export type TaskStatus = "all" | "pending" | "completed"
