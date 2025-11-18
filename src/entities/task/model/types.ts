/**
 * Task entity types
 */
export type TaskLifecycleStatus = "OPEN" | "IN_PROGRESS" | "DONE" | "BLOCKED" | "ARCHIVED"

export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  status: TaskLifecycleStatus
  listId: string
  priority?: TaskPriority
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export type TaskStatus = "all" | "pending" | "completed"
