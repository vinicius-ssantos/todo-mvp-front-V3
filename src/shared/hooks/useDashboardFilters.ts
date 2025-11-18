import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { TaskStatus } from "@/entities/task/model/types"

export type DateFilter = "all" | "today" | "week" | "overdue"

export interface DashboardFilters {
  selectedListId?: string
  statusFilter: TaskStatus
  dateFilter: DateFilter
  search: string
}

export interface DashboardFiltersHandlers {
  handleSelectList: (id?: string) => void
  handleStatusChange: (filter: TaskStatus) => void
  handleDateChange: (date: DateFilter) => void
  handleSearchChange: (value: string) => void
}

export interface UseDashboardFiltersReturn extends DashboardFilters, DashboardFiltersHandlers {}

/**
 * Custom hook to manage dashboard filters with URL synchronization
 *
 * Responsibilities:
 * - Manages filter state (list, status, date, search)
 * - Synchronizes state with URL search params
 * - Provides handlers to update filters
 *
 * @returns Filter state and handlers
 */
export function useDashboardFilters(): UseDashboardFiltersReturn {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Filter state
  const [selectedListId, setSelectedListId] = useState<string | undefined>()
  const [statusFilter, setStatusFilter] = useState<TaskStatus>("all")
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")
  const [search, setSearch] = useState("")

  /**
   * Updates URL search params with new filter values
   * Removes params with default values (all, empty string)
   */
  const setParams = useCallback(
    (patch: Record<string, string | undefined>) => {
      const qs = new URLSearchParams(searchParams.toString())

      for (const [key, value] of Object.entries(patch)) {
        if (!value || value === "" || value === "all") {
          qs.delete(key)
        } else {
          qs.set(key, value)
        }
      }

      const nextUrl = `${pathname}${qs.toString() ? `?${qs.toString()}` : ""}`
      router.replace(nextUrl)
    },
    [router, pathname, searchParams]
  )

  /**
   * Synchronizes state from URL on mount and URL changes
   */
  useEffect(() => {
    const sp = new URLSearchParams(searchParams.toString())

    const list = sp.get("list") ?? undefined
    const status = sp.get("status")
    const date = sp.get("date")
    const q = sp.get("q") ?? ""

    if (list !== undefined) {
      setSelectedListId(list)
    }

    if (status === "pending" || status === "completed" || status === "all" || status === null) {
      setStatusFilter((status ?? "all") as TaskStatus)
    }

    if (date === "today" || date === "week" || date === "overdue" || date === "all" || date === null) {
      setDateFilter((date ?? "all") as DateFilter)
    }

    setSearch(q)
  }, [searchParams])

  /**
   * Handlers that update state and sync to URL
   */
  const handleSelectList = useCallback(
    (id?: string) => {
      setSelectedListId(id)
      setParams({ list: id })
    },
    [setParams]
  )

  const handleStatusChange = useCallback(
    (filter: TaskStatus) => {
      setStatusFilter(filter)
      setParams({ status: filter })
    },
    [setParams]
  )

  const handleDateChange = useCallback(
    (date: DateFilter) => {
      setDateFilter(date)
      setParams({ date })
    },
    [setParams]
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value)
      setParams({ q: value })
    },
    [setParams]
  )

  return {
    // State
    selectedListId,
    statusFilter,
    dateFilter,
    search,
    // Handlers
    handleSelectList,
    handleStatusChange,
    handleDateChange,
    handleSearchChange,
  }
}
