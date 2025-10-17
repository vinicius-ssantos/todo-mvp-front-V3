"use client"

import { useLists } from "@/entities/list/api/queries"
import { CreateListDialog } from "@/features/create-list/ui/CreateListDialog"
import { RenameListDialog } from "@/features/rename-list/ui/RenameListDialog"
import { DeleteListDialog } from "@/features/delete-list/ui/DeleteListDialog"
import { Spinner } from "@/shared/ui"
import { cn } from "@/shared/lib/utils"
import { ListTodo } from "lucide-react"

interface SidebarListsProps {
  selectedListId?: string
  onSelectList: (listId: string) => void
}

/**
 * Sidebar widget to display and manage lists
 */
export function SidebarLists({ selectedListId, onSelectList }: SidebarListsProps) {
  const { data: lists, isLoading, error } = useLists()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive">
        <p>Erro ao carregar listas</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ListTodo className="h-5 w-5" />
          Minhas Listas
        </h2>
        <CreateListDialog />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {lists && lists.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <p>Nenhuma lista criada ainda.</p>
            <p className="mt-1">Crie sua primeira lista!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {lists?.map((list) => (
              <div
                key={list.id}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors group",
                  selectedListId === list.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                )}
                onClick={() => onSelectList(list.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{list.name}</p>
                  {list.counts && (
                    <p className="text-xs opacity-70">
                      {list.counts.completed} de {list.counts.total} concluídas
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <RenameListDialog list={list} />
                  <DeleteListDialog list={list} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
