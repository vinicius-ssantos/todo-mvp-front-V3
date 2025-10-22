"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SidebarLists } from "@/widgets/sidebar-lists";
import { TaskTable } from "@/widgets/task-table";
import { FiltersBar } from "@/widgets/filters-bar";
import { Button } from "@/shared/ui";
import { http } from "@/shared/api";
import { LogOut, ListTodo } from "lucide-react";
import { toast } from "sonner";

/**
 * Main dashboard page
 */
export default function HomePage() {
  const router = useRouter();
  const [selectedListId, setSelectedListId] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "overdue">("all");
  const [search, setSearch] = useState("");
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const setParams = useCallback((patch: Record<string, string | undefined>) => {
    const qs = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (!v || v === "" || v === "all") qs.delete(k);
      else qs.set(k, v);
    }
    const next = `${pathname}${qs.toString() ? `?${qs.toString()}` : ""}`;
    router.replace(next);
  }, [router, pathname, searchParams]);

  // Sincroniza estado <- URL
  useEffect(() => {
    const sp = new URLSearchParams(searchParams.toString());
    const list = sp.get("list") ?? undefined;
    const status = sp.get("status");
    const date = sp.get("date");
    const q = sp.get("q") ?? "";

    if (list !== undefined) setSelectedListId(list);
    if (status === "pending" || status === "completed" || status === "all" || status === null) {
      setStatusFilter(((status ?? "all") as unknown) as "all" | "pending" | "completed");
    }
    if (date === "today" || date === "week" || date === "overdue" || date === "all" || date === null) {
      setDateFilter(((date ?? "all") as unknown) as "all" | "today" | "week" | "overdue");
    }
    setSearch(q);
  }, [searchParams]);

  // Handlers que atualizam estado -> URL
  const handleSelectList = (id?: string) => {
    setSelectedListId(id);
    setParams({ list: id });
  };
  const handleStatusChange = (f: "all" | "pending" | "completed") => {
    setStatusFilter(f);
    setParams({ status: f });
  };
  const handleDateChange = (d: "all" | "today" | "week" | "overdue") => {
    setDateFilter(d);
    setParams({ date: d });
  };
  const handleSearchChange = (v: string) => {
    setSearch(v);
    setParams({ q: v });
  };



  const handleLogout = async () => {
    try {
      await http("/api/session/logout", { method: "POST" });
      toast.success("Logout realizado com sucesso!");
      router.push("/login");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

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
              {(statusFilter !== "all" || dateFilter !== "all" || search) && (
              <div className="text-sm text-muted-foreground">
                Filtros ativos:
                {statusFilter !== "all" && <> Status: {statusFilter}.</>}
                {dateFilter !== "all" && <> Prazo: {dateFilter}.</>}
                {search && <> Busca: “{search}”.</>}
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
