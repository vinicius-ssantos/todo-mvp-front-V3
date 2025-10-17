"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, toast } from "@/shared/ui"
import { useDeleteList } from "@/entities/list/api/mutations"
import { ApiError } from "@/shared/api"
import type { List } from "@/entities/list/model/types"

interface DeleteListDialogProps {
  list: List
}

/**
 * Dialog to delete a list with confirmation
 */
export function DeleteListDialog({ list }: DeleteListDialogProps) {
  const [open, setOpen] = useState(false)
  const deleteList = useDeleteList()

  const handleDelete = async () => {
    try {
      await deleteList.mutateAsync(list.id)
      toast.success("Lista excluída com sucesso!")
      setOpen(false)
    } catch (error) {
      const message = error instanceof ApiError ? error.getUserMessage() : "Erro ao excluir lista"
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Lista</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir a lista <strong>{list.name}</strong>? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteList.isPending}>
              {deleteList.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
