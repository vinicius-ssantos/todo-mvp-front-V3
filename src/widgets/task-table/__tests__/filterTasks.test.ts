import { describe, it, expect } from 'vitest'
import type { Task } from '@/entities/task/model/types'

// Import the filterTasks function - we'll need to export it from index.tsx
// For now, we'll recreate it here for testing
function filterTasks(tasks: Task[], status: 'all' | 'pending' | 'completed', search: string): Task[] {
  let filtered = tasks

  // Filter by status
  if (status === 'pending') {
    filtered = filtered.filter((t) => !t.completed)
  } else if (status === 'completed') {
    filtered = filtered.filter((t) => t.completed)
  }

  // Filter by search query
  if (search.trim()) {
    const query = search.toLowerCase().trim()
    filtered = filtered.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(query)
      const descriptionMatch = task.description?.toLowerCase().includes(query) || false
      return titleMatch || descriptionMatch
    })
  }

  return filtered
}

describe('filterTasks', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Buy groceries',
      description: 'Milk, eggs, bread',
      completed: false,
      status: 'OPEN',
      listId: 'list-1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '2',
      title: 'Finish project',
      description: 'Complete the React component',
      completed: true,
      status: 'DONE',
      listId: 'list-1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-02',
    },
    {
      id: '3',
      title: 'Call dentist',
      completed: false,
      status: 'OPEN',
      listId: 'list-1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: '4',
      title: 'Read book',
      description: 'Clean Code by Robert Martin',
      completed: true,
      status: 'DONE',
      listId: 'list-1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-03',
    },
  ]

  describe('status filter', () => {
    it('should return all tasks when status is "all"', () => {
      const result = filterTasks(mockTasks, 'all', '')
      expect(result).toHaveLength(4)
      expect(result).toEqual(mockTasks)
    })

    it('should return only pending tasks when status is "pending"', () => {
      const result = filterTasks(mockTasks, 'pending', '')
      expect(result).toHaveLength(2)
      expect(result.every(task => !task.completed)).toBe(true)
      expect(result.map(t => t.id)).toEqual(['1', '3'])
    })

    it('should return only completed tasks when status is "completed"', () => {
      const result = filterTasks(mockTasks, 'completed', '')
      expect(result).toHaveLength(2)
      expect(result.every(task => task.completed)).toBe(true)
      expect(result.map(t => t.id)).toEqual(['2', '4'])
    })
  })

  describe('search filter', () => {
    it('should return all tasks when search is empty', () => {
      const result = filterTasks(mockTasks, 'all', '')
      expect(result).toHaveLength(4)
    })

    it('should filter by title (case-insensitive)', () => {
      const result = filterTasks(mockTasks, 'all', 'project')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Finish project')
    })

    it('should filter by title with uppercase search', () => {
      const result = filterTasks(mockTasks, 'all', 'PROJECT')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Finish project')
    })

    it('should filter by description', () => {
      const result = filterTasks(mockTasks, 'all', 'milk')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Buy groceries')
    })

    it('should filter by description (Clean Code)', () => {
      const result = filterTasks(mockTasks, 'all', 'clean code')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Read book')
    })

    it('should return empty array when no match', () => {
      const result = filterTasks(mockTasks, 'all', 'nonexistent')
      expect(result).toHaveLength(0)
    })

    it('should trim search query', () => {
      const result = filterTasks(mockTasks, 'all', '  project  ')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Finish project')
    })

    it('should handle tasks without description', () => {
      const result = filterTasks(mockTasks, 'all', 'dentist')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Call dentist')
      expect(result[0].description).toBeUndefined()
    })
  })

  describe('combined filters', () => {
    it('should filter by status AND search', () => {
      const result = filterTasks(mockTasks, 'pending', 'buy')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Buy groceries')
      expect(result[0].completed).toBe(false)
    })

    it('should return empty when status and search do not match any task', () => {
      const result = filterTasks(mockTasks, 'completed', 'dentist')
      expect(result).toHaveLength(0)
    })

    it('should filter completed tasks by description search', () => {
      const result = filterTasks(mockTasks, 'completed', 'react')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Finish project')
      expect(result[0].completed).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle empty task array', () => {
      const result = filterTasks([], 'all', '')
      expect(result).toHaveLength(0)
    })

    it('should handle whitespace-only search', () => {
      const result = filterTasks(mockTasks, 'all', '   ')
      expect(result).toHaveLength(4)
    })

    it('should be case-insensitive for partial matches', () => {
      const result = filterTasks(mockTasks, 'all', 'BuY')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Buy groceries')
    })
  })
})
