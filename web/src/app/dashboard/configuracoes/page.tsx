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
import { Loader2, User, Lock, Bell, Palette, ShoppingBag, Package, Eye, Store, AlertTriangle, Info } from "lucide-react";
import { showError, showSuccess } from "@/lib/toast";
import { useState, useEffect } from "react";

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
    values: {
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
    mutationFn: async (data: ProfileFormData) => {
      if (!user?.id) throw new Error("Usuário não encontrado");
      return usersService.update(user.id, {
        name: data.name,
        email: data.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      showSuccess("Perfil atualizado com sucesso!");
      resetProfile({
        name: user?.name || "",
        email: user?.email || "",
      });
    },
    onError: (error: Error) => {
      showError(error.message || "Erro ao atualizar perfil");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      if (!user?.id) throw new Error("Usuário não encontrado");
      // O backend aceita apenas 'password' para atualização
      // TODO: Implementar validação de senha atual no backend
      return usersService.update(user.id, {
        password: data.newPassword,
      });
    },
    onSuccess: () => {
      showSuccess("Senha alterada com sucesso!");
      resetPassword();
    },
    onError: (error: Error) => {
      showError(error.message || "Erro ao alterar senha");
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
            <NotificationPreferences />
          )}
        </div>
      </div>
    </div>
  );
}

// Componente de Preferências de Notificações
function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    newOrder: true,
    orderStatusChanged: true,
    lowStock: true,
    productAdded: false,
    storeUpdated: false,
    system: true,
    emailNotifications: false,
    browserNotifications: true,
  });

  useEffect(() => {
    // Carregar preferências do localStorage
    const saved = localStorage.getItem("notificationPreferences");
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading notification preferences:", error);
      }
    }
  }, []);

  const handleToggle = (key: keyof typeof preferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);
    localStorage.setItem("notificationPreferences", JSON.stringify(newPreferences));
    showSuccess("Preferência atualizada!");
  };

  const handleSave = () => {
    localStorage.setItem("notificationPreferences", JSON.stringify(preferences));
    showSuccess("Preferências salvas com sucesso!");
  };

  const handleReset = () => {
    const defaultPreferences = {
      newOrder: true,
      orderStatusChanged: true,
      lowStock: true,
      productAdded: false,
      storeUpdated: false,
      system: true,
      emailNotifications: false,
      browserNotifications: true,
    };
    setPreferences(defaultPreferences);
    localStorage.setItem("notificationPreferences", JSON.stringify(defaultPreferences));
    showSuccess("Preferências resetadas para o padrão!");
  };

  const notificationTypes = [
    {
      key: "newOrder" as const,
      label: "Novos Pedidos",
      description: "Receba notificações quando um novo pedido for realizado",
      icon: ShoppingBag,
      color: "text-green-600 dark:text-green-400 bg-green-500/10 dark:bg-green-500/20",
    },
    {
      key: "orderStatusChanged" as const,
      label: "Mudanças de Status",
      description: "Notificações quando o status de um pedido for alterado",
      icon: ShoppingBag,
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20",
    },
    {
      key: "lowStock" as const,
      label: "Estoque Baixo",
      description: "Alertas quando produtos estiverem com estoque baixo",
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400 bg-orange-500/10 dark:bg-orange-500/20",
    },
    {
      key: "productAdded" as const,
      label: "Novos Produtos",
      description: "Notificações quando novos produtos forem adicionados",
      icon: Package,
      color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 dark:bg-purple-500/20",
    },
    {
      key: "storeUpdated" as const,
      label: "Atualizações da Loja",
      description: "Notificações sobre mudanças nas configurações da loja",
      icon: Store,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20",
    },
    {
      key: "system" as const,
      label: "Notificações do Sistema",
      description: "Mensagens importantes do sistema",
      icon: Info,
      color: "text-gray-600 dark:text-gray-400 bg-gray-500/10 dark:bg-gray-500/20",
    },
  ];

  return (
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

      <div className="space-y-6">
        {/* Canais de Notificação */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Canais de Notificação</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Notificações no Navegador</p>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações em tempo real no navegador
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("browserNotifications")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.browserNotifications ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.browserNotifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Notificações por E-mail</p>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações importantes por e-mail
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle("emailNotifications")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.emailNotifications ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.emailNotifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Tipos de Notificação */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Tipos de Notificação</h3>
          <div className="space-y-3">
            {notificationTypes.map((type) => {
              const Icon = type.icon;
              const isEnabled = preferences[type.key];
              return (
                <div
                  key={type.key}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{type.label}</p>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(type.key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isEnabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-4 pt-4 border-t">
          <Button onClick={handleSave} className="flex-1">
            Salvar Preferências
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Restaurar Padrão
          </Button>
        </div>
      </div>
    </Card>
  );
}

