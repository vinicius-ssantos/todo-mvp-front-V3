"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, toast } from "@/shared/ui";
import { http, ApiError } from "@/shared/api";
import { ListTodo } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { listKeys } from "@/entities/list/api/queries";

const loginFormSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginForm = z.infer<typeof loginFormSchema>;

/**
 * Login page
 */
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await http("/api/session/login", {
        method: "POST",
        json: data,
      });

      queryClient.invalidateQueries({ queryKey: listKeys.all }).catch(() => {});

      toast.success("Login realizado com sucesso!");
      router.replace(next);
    } catch (error) {
      const message = error instanceof ApiError ? error.getUserMessage() : "Erro ao fazer login";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
              <ListTodo className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Bem-vindo de volta</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Entre com suas credenciais para continuar
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              Não tem uma conta?{" "}
              <a href="/register" className="text-primary hover:underline">
                Cadastre-se
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
