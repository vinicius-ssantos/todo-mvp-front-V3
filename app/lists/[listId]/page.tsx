"use client"

import { useParams, useRouter } from "next/navigation"
import { TaskTable } from "@/widgets/task-table"
import { useListDetail } from "@/entities/list/api/queries"
import { Button, Spinner } from "@/shared/ui"
import { ArrowLeft, ListTodo } from "lucide-react"

/**
 * Individual list detail page
 */
export default function ListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const listId = params.listId as string

  const { data: list, isLoading, error } = useListDetail(listId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !list) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar lista</p>
          <Button onClick={() => router.push("/")}>Voltar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-3">
              <ListTodo className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">{list.name}</h1>
                {list.description && <p className="text-sm text-muted-foreground">{list.description}</p>}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6">
        <TaskTable listId={listId} />
      </main>
    </div>
  )
}
