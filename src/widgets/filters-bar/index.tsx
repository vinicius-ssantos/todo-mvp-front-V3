"use client";

import { Button } from "@/shared/ui";
import { Search } from "lucide-react";
import { Input } from "@/shared/ui";
import type { TaskStatus } from "@/entities/task/model/types";

interface FiltersBarProps {
  statusFilter: TaskStatus;
  onFilterChange: (filter: TaskStatus) => void;
  searchValue: string;
  onSearchChange: (search: string) => void;
  dateFilter: "all" | "today" | "week" | "overdue";
  onDateFilterChange: (f: "all" | "today" | "week" | "overdue") => void;
}

/**
 * Controlled component for filtering and searching tasks
 *
 * All state is managed by the parent component.
 * This component is purely presentational (no local state).
 */
export function FiltersBar({
  statusFilter,
  onFilterChange,
  searchValue,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
}: FiltersBarProps) {
  return (
    <div className="flex flex-col gap-3 p-4 border-b border-border bg-card">
      {/* Search input */}
      <div className="w-full relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tarefas..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Date filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={dateFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onDateFilterChange("all")}
        >
          Todas
        </Button>
        <Button
          variant={dateFilter === "today" ? "default" : "outline"}
          size="sm"
          onClick={() => onDateFilterChange("today")}
        >
          Hoje
        </Button>
        <Button
          variant={dateFilter === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => onDateFilterChange("week")}
        >
          Semana
        </Button>
        <Button
          variant={dateFilter === "overdue" ? "default" : "outline"}
          size="sm"
          onClick={() => onDateFilterChange("overdue")}
        >
          Atrasadas
        </Button>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("all")}
        >
          Todas
        </Button>
        <Button
          variant={statusFilter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("pending")}
        >
          Pendentes
        </Button>
        <Button
          variant={statusFilter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange("completed")}
        >
          Concluídas
        </Button>
      </div>
    </div>
  );
}
