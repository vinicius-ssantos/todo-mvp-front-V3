"use client"

import { useState } from "react"
import { Button } from "@/shared/ui"
import { Search } from "lucide-react"
import { Input } from "@/shared/ui"
import type { TaskStatus } from "@/entities/task/model/types"

interface FiltersBarProps {
  onFilterChange?: (filter: TaskStatus) => void
  onSearchChange?: (search: string) => void
  dateFilter?: "all" | "today" | "week" | "overdue"
  onDateFilterChange?: (f: "all" | "today" | "week" | "overdue") => void
}

/**
 * Widget for filtering and searching tasks
 */
export function FiltersBar({ onFilterChange, onSearchChange }: FiltersBarProps) {
  export function FiltersBar({
    onFilterChange,
    onSearchChange,
    dateFilter = "all",
    onDateFilterChange,
  }: FiltersBarProps) {
    const [activeFilter, setActiveFilter] = useState<TaskStatus>("all");
    const [search, setSearch] = useState("");

    const handleFilterChange = (filter: TaskStatus) => {
      setActiveFilter(filter);
      onFilterChange?.(filter);
    };

    const handleSearchChange = (value: string) => {
      setSearch(value);
      onSearchChange?.(value);
    };

    return (
      <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border bg-card">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Data filters */}
        <div className="flex gap-2">
          <Button
            variant={dateFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => onDateFilterChange?.("all")}
          >
            Todas
          </Button>
          <Button
            variant={dateFilter === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => onDateFilterChange?.("today")}
          >
            Hoje
          </Button>
          <Button
            variant={dateFilter === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => onDateFilterChange?.("week")}
          >
            Semana
          </Button>
          <Button
            variant={dateFilter === "overdue" ? "default" : "outline"}
            size="sm"
            onClick={() => onDateFilterChange?.("overdue")}
          >
            Atrasadas
          </Button>
        </div>

        {/* Status filters */}
        <div className="flex gap-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("all")}
          >
            Todas
          </Button>
          <Button
            variant={activeFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("pending")}
          >
            Pendentes
          </Button>
          <Button
            variant={activeFilter === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("completed")}
          >
            Concluídas
          </Button>
        </div>
      </div>
    );
  }
}