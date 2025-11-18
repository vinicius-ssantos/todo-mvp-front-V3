"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TaskTable } from "@/widgets/task-table";
import { useListDetail } from "@/entities/list/api/queries";
import { Button, Spinner } from "@/shared/ui";
import { ArrowLeft, ListTodo } from "lucide-react";

/**
 * Individual list detail page
 */
export default function ListDetailPage() {
  // CHANGED: leitura do param um pouco mais defensiva (evita cast cego).
  const params = useParams();
  const raw = params?.listId as string | string[] | undefined;
  const listId = Array.isArray(raw) ? raw[0] : (raw ?? "");

  const router = useRouter();

  const { data: list, isLoading, error } = useListDetail(listId);

  // CHANGED: mantive o Spinner, mas já com estrutura de página para evitar "jump".
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="h-6 w-40 rounded bg-muted/50" />
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-center h-40">
            <Spinner className="h-8 w-8" />
          </div>
        </main>
      </div>
    );
  }

  // CHANGED: região de erro com aria e opção de retry; "Voltar" como Link sem JS imperativo.
  if (error || !list) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        role="alert"
        aria-live="assertive"
      >
        <div className="text-center">
          <p className="text-destructive mb-4">Erro ao carregar lista</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => router.refresh()}>Tentar novamente</Button>
            <Button variant="secondary" asChild>
              <Link href="/">Voltar</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* CHANGED: Link já existia (ok); apenas aria-hidden no ícone e aria-label no Link */}
            <Button variant="ghost" size="sm" asChild className="gap-2">
              <Link href="/" aria-label="Voltar para a página inicial">
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Voltar
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <ListTodo className="h-6 w-6 text-primary" aria-hidden />{" "}
              {/* CHANGED: aria-hidden decorativo */}
              {/* CHANGED: id para ligar no main via aria-labelledby */}
              <h1 id="list-title" className="text-2xl font-bold">
                {list.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      {/* CHANGED: largura do main unificada com o header (6xl) e aria-labelledby */}
      <main className="max-w-6xl mx-auto p-6" aria-labelledby="list-title">
        {/* CHANGED: mantém apenas listId; este arquivo NÃO é a origem do erro de props */}
        <TaskTable listId={listId} />
      </main>
    </div>
  );
}
