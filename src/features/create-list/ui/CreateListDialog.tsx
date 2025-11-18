"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
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
} from "@/shared/ui";
import { useCreateList } from "@/entities/list/api/mutations";
import { ApiError } from "@/shared/api";

const createListFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
});

type CreateListForm = z.infer<typeof createListFormSchema>;

/**
 * Dialog to create a new list
 */
export function CreateListDialog() {
  const [open, setOpen] = useState(false);
  const createList = useCreateList();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateListForm>({
    resolver: zodResolver(createListFormSchema),
  });

  const onSubmit = async (data: CreateListForm) => {
    try {
      await createList.mutateAsync(data.name);
      toast.success("Lista criada com sucesso!");
      setOpen(false);
      reset();
    } catch (error) {
      const message = error instanceof ApiError ? error.getUserMessage() : "Erro ao criar lista";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Lista
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Lista</DialogTitle>
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
            <Button type="submit" disabled={createList.isPending}>
              {createList.isPending ? "Criando..." : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
