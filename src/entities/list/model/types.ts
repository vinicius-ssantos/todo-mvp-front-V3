/**
 * List entity types
 */
export interface List {
  id: string
  name: string
  counts?: {
    total: number
    completed: number
    pending: number
  }
  createdAt: string
  updatedAt: string
}

export interface ListDetail extends List {
  description?: string
}
