"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { usersService } from "@/services/users-service";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, User, Lock, Bell, Palette } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const profileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(120, "Nome muito longo"),
  email: z.string().email("E-mail inválido"),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "notifications">("profile");

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => {
      // TODO: Implementar endpoint de atualização de perfil
      return Promise.resolve(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Perfil atualizado com sucesso!");
      resetProfile();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar perfil");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (data: PasswordFormData) => {
      // TODO: Implementar endpoint de alteração de senha
      return Promise.resolve(data);
    },
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      resetPassword();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao alterar senha");
    },
  });

  const onSubmitProfile = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitPassword = (data: PasswordFormData) => {
    updatePasswordMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas preferências e informações da conta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  activeTab === "profile"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-accent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5" />
                  <span className="font-medium">Perfil</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  activeTab === "password"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-accent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5" />
                  <span className="font-medium">Senha</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  activeTab === "notifications"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-accent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5" />
                  <span className="font-medium">Notificações</span>
                </div>
              </button>
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "profile" && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Informações do Perfil</h2>
                  <p className="text-sm text-muted-foreground">Atualize suas informações pessoais</p>
                </div>
              </div>
              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nome *</FieldLabel>
                    <Input
                      id="name"
                      {...registerProfile("name")}
                      aria-invalid={profileErrors.name ? "true" : "false"}
                    />
                    {profileErrors.name && (
                      <p className="text-sm text-destructive mt-1">
                        {profileErrors.name.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="email">E-mail *</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      {...registerProfile("email")}
                      aria-invalid={profileErrors.email ? "true" : "false"}
                    />
                    {profileErrors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {profileErrors.email.message}
                      </p>
                    )}
                  </Field>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        "Salvar Alterações"
                      )}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </Card>
          )}

          {activeTab === "password" && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Alterar Senha</h2>
                  <p className="text-sm text-muted-foreground">Mantenha sua conta segura</p>
                </div>
              </div>
              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="currentPassword">Senha Atual *</FieldLabel>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...registerPassword("currentPassword")}
                      aria-invalid={passwordErrors.currentPassword ? "true" : "false"}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-destructive mt-1">
                        {passwordErrors.currentPassword.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="newPassword">Nova Senha *</FieldLabel>
                    <Input
                      id="newPassword"
                      type="password"
                      {...registerPassword("newPassword")}
                      aria-invalid={passwordErrors.newPassword ? "true" : "false"}
                    />
                    <FieldDescription>
                      A senha deve ter no mínimo 6 caracteres
                    </FieldDescription>
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-destructive mt-1">
                        {passwordErrors.newPassword.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirmar Nova Senha *</FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...registerPassword("confirmPassword")}
                      aria-invalid={passwordErrors.confirmPassword ? "true" : "false"}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-destructive mt-1">
                        {passwordErrors.confirmPassword.message}
                      </p>
                    )}
                  </Field>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={updatePasswordMutation.isPending}
                    >
                      {updatePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Alterando...
                        </>
                      ) : (
                        "Alterar Senha"
                      )}
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Preferências de Notificações</h2>
                  <p className="text-sm text-muted-foreground">Configure como você recebe notificações</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-6 bg-muted rounded-lg text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-2">
                    As configurações de notificações serão implementadas em breve.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Em breve você poderá personalizar como recebe notificações sobre pedidos, produtos e muito mais.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

