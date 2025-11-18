import type { TaskLifecycleStatus, TaskPriority } from "@/entities/task/model/types"

/**
 * Task priority options for select components
 */
export const TASK_PRIORITY_OPTIONS = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
] as const satisfies readonly { value: TaskPriority; label: string }[]

/**
 * Task lifecycle status options for select components
 */
export const TASK_STATUS_OPTIONS: { value: TaskLifecycleStatus; label: string }[] = [
  { value: "OPEN", label: "Aberta" },
  { value: "IN_PROGRESS", label: "Em progresso" },
  { value: "DONE", label: "Concluída" },
  { value: "BLOCKED", label: "Bloqueada" },
  { value: "ARCHIVED", label: "Arquivada" },
]
