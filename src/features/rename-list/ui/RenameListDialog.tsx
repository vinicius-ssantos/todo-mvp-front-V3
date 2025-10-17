"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Edit2 } from "lucide-react"
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  toast,
} from "@/shared/ui"
import { useRenameList } from "@/entities/list/api/mutations"
import { ApiError } from "@/shared/api"
import type { List } from "@/entities/list/model/types"

const renameListFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
})

type RenameListForm = z.infer<typeof renameListFormSchema>

interface RenameListDialogProps {
  list: List
}

/**
 * Dialog to rename an existing list
 */
export function RenameListDialog({ list }: RenameListDialogProps) {
  const [open, setOpen] = useState(false)
  const renameList = useRenameList()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RenameListForm>({
    resolver: zodResolver(renameListFormSchema),
    defaultValues: {
      name: list.name,
    },
  })

  const onSubmit = async (data: RenameListForm) => {
    try {
      await renameList.mutateAsync({ id: list.id, name: data.name })
      toast.success("Lista renomeada com sucesso!")
      setOpen(false)
    } catch (error) {
      const message = error instanceof ApiError ? error.getUserMessage() : "Erro ao renomear lista"
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Renomear Lista</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Lista</Label>
            <Input id="name" placeholder="Ex: Trabalho, Pessoal..." {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={renameList.isPending}>
              {renameList.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
