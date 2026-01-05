"use client";

import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { usersService } from "@/services/users-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showError, showSuccess } from "@/lib/toast";
import { AuthLayout } from "@/components/auth-layout";

const profileSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, isLoading: isLoadingUser } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: user
      ? {
          name: user.name,
          email: user.email,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) => {
      if (!user) throw new Error("Usuário não autenticado");
      return usersService.update(user.id, data);
    },
    onSuccess: () => {
      showSuccess("Perfil atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (error: Error) => {
      showError(
        error instanceof Error ? error.message : "Erro ao atualizar perfil."
      );
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoadingUser) {
    return (
      <AuthLayout>
        <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AuthLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nome completo</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  {...register("name")}
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </Field>
              <Field>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">Função:</p>
                  <p className="capitalize">{user.role.toLowerCase()}</p>
                </div>
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}

