"use client";

import { useRouter } from "next/navigation";
import { SidebarLists } from "@/widgets/sidebar-lists";
import { TaskTable } from "@/widgets/task-table";
import { FiltersBar } from "@/widgets/filters-bar";
import { Button } from "@/shared/ui";
import { http } from "@/shared/api";
import { LogOut, ListTodo } from "lucide-react";
import { toast } from "sonner";
import { useDashboardFilters } from "@/shared/hooks/useDashboardFilters";

/**
 * Main dashboard page
 *
 * Displays the task management interface with:
 * - Sidebar for list selection
 * - Filters bar for task filtering
 * - Task table for viewing and managing tasks
 */
export default function HomePage() {
  const router = useRouter();

  // Filter state and handlers extracted to custom hook (SRP compliance)
  const {
    selectedListId,
    statusFilter,
    dateFilter,
    search,
    handleSelectList,
    handleStatusChange,
    handleDateChange,
    handleSearchChange,
  } = useDashboardFilters();

  const handleLogout = async () => {
    try {
      await http("/api/session/logout", { method: "POST" });
      toast.success("Logout realizado com sucesso!");
      router.push("/login");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  const hasActiveFilters = statusFilter !== "all" || dateFilter !== "all" || search;

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <ListTodo className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">TodoList App</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-2 bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r border-border bg-card overflow-hidden">
          <SidebarLists selectedListId={selectedListId} onSelectList={handleSelectList} />
        </aside>

        {/* Main area */}
        <main className="flex-1 overflow-y-auto">
          {selectedListId ? (
            <div className="max-w-4xl mx-auto p-6 space-y-4">
              <FiltersBar
                onFilterChange={handleStatusChange}
                onSearchChange={handleSearchChange}
                dateFilter={dateFilter}
                onDateFilterChange={handleDateChange}
              />

              {hasActiveFilters && (
                <div className="text-sm text-muted-foreground">
                  Filtros ativos:
                  {statusFilter !== "all" && <> Status: {statusFilter}.</>}
                  {dateFilter !== "all" && <> Prazo: {dateFilter}.</>}
                  {search && <> Busca: &ldquo;{search}&rdquo;.</>}
                </div>
              )}

              <TaskTable
                listId={selectedListId}
                date={dateFilter}
                status={statusFilter}
                search={search}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div className="max-w-md">
                <ListTodo className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h2 className="text-2xl font-semibold mb-2">Selecione uma lista</h2>
                <p className="text-muted-foreground">
                  Escolha uma lista na barra lateral para visualizar e gerenciar suas tarefas.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
