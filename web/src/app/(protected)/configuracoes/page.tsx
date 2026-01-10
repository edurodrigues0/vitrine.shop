"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { usersService } from "@/services/users-service";
import { storesService } from "@/services/stores-service";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, User, Lock, Bell, Palette, ShoppingBag, Package, Eye, Store, AlertTriangle, Info, CreditCard, MapPin } from "lucide-react";
import { showError, showSuccess } from "@/lib/toast";
import { useState, useEffect, useMemo } from "react";
import { useSelectedStore } from "@/hooks/use-selected-store";
import { subscriptionsService } from "@/services/subscriptions-service";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Building2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useConfirm } from "@/hooks/use-confirm";
import { addressesService } from "@/services/addresses-service";
import { citiesService } from "@/services/cities-service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "notifications" | "subscription" | "theme" | "address">("profile");

  // Verificar se há uma aba específica na URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "subscription") {
      setActiveTab("subscription");
    } else if (tab === "address") {
      setActiveTab("address");
    }
  }, [searchParams]);

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
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === "profile"
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
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === "password"
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
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === "notifications"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-accent"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5" />
                  <span className="font-medium">Notificações</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("subscription")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === "subscription"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-accent"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">Planos e Assinatura</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("theme")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === "theme"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-accent"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5" />
                  <span className="font-medium">Aparência da Loja</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("address")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === "address"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:bg-accent"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5" />
                  <span className="font-medium">Endereço da Loja</span>
                </div>
              </button>
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "profile" && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Informações do Perfil</h2>
                  <p className="text-sm text-muted-foreground">Atualize suas informações pessoais</p>
                </div>
              </div>
              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6 mt-6">
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
              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Alterar Senha</h2>
                  <p className="text-sm text-muted-foreground">Mantenha sua conta segura</p>
                </div>
              </div>
              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6 mt-6">
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

          {activeTab === "theme" && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Aparência da Loja</h2>
                  <p className="text-sm text-muted-foreground">Personalize as cores e o visual da sua loja</p>
                </div>
              </div>
              <div className="mt-6">
                <ThemeForm />
              </div>
            </Card>
          )}

          {activeTab === "notifications" && (
            <NotificationPreferences />
          )}

          {activeTab === "subscription" && (
            <SubscriptionPlans />
          )}

          {activeTab === "address" && (
            <Card className="p-6">
              <AddressForm />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ThemeForm() {
  const { selectedStore } = useSelectedStore();
  const queryClient = useQueryClient();

  const themeSchema = z.object({
    primary: z.string().min(1, "Cor obrigatória"),
    primaryGradient: z.string().optional(),
    secondary: z.string().min(1, "Cor obrigatória"),
    bg: z.string().min(1, "Cor obrigatória"),
    surface: z.string().min(1, "Cor obrigatória"),
    text: z.string().min(1, "Cor obrigatória"),
    textSecondary: z.string().min(1, "Cor obrigatória"),
    highlight: z.string().min(1, "Cor obrigatória"),
    border: z.string().min(1, "Cor obrigatória"),
    hover: z.string().min(1, "Cor obrigatória"),
    overlay: z.string().optional(),
  });

  type ThemeFormData = z.infer<typeof themeSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ThemeFormData>({
    resolver: zodResolver(themeSchema),
    defaultValues: selectedStore?.theme || {
      primary: "#000000",
      secondary: "#ffffff",
      bg: "#ffffff",
      surface: "#f3f4f6",
      text: "#000000",
      textSecondary: "#6b7280",
      highlight: "#fbbf24",
      border: "#e5e7eb",
      hover: "#d1d5db",
    },
  });

  useEffect(() => {
    if (selectedStore?.theme) {
      reset(selectedStore.theme);
    }
  }, [selectedStore, reset]);

  const updateThemeMutation = useMutation({
    mutationFn: async (data: ThemeFormData) => {
      if (!selectedStore?.id) throw new Error("Loja não selecionada");
      return storesService.update(selectedStore.id, {
        theme: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      showSuccess("Tema atualizado com sucesso!");
    },
    onError: (error: Error) => {
      showError(error.message || "Erro ao atualizar tema");
    },
  });

  const onSubmit = (data: ThemeFormData) => {
    updateThemeMutation.mutate(data);
  };

  if (!selectedStore) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field>
          <FieldLabel>Cor Primária</FieldLabel>
          <div className="flex gap-2">
            <Input type="color" className="w-12 h-10 p-1 cursor-pointer" {...register("primary")} />
            <Input type="text" {...register("primary")} placeholder="#000000" />
          </div>
          {errors.primary && <p className="text-sm text-destructive">{errors.primary.message}</p>}
        </Field>

        <Field>
          <FieldLabel>Gradiente Primário (Opcional)</FieldLabel>
          <Input type="text" {...register("primaryGradient")} placeholder="linear-gradient(...)" />
        </Field>

        <Field>
          <FieldLabel>Cor Secundária</FieldLabel>
          <div className="flex gap-2">
            <Input type="color" className="w-12 h-10 p-1 cursor-pointer" {...register("secondary")} />
            <Input type="text" {...register("secondary")} placeholder="#ffffff" />
          </div>
          {errors.secondary && <p className="text-sm text-destructive">{errors.secondary.message}</p>}
        </Field>

        <Field>
          <FieldLabel>Cor de Fundo</FieldLabel>
          <div className="flex gap-2">
            <Input type="color" className="w-12 h-10 p-1 cursor-pointer" {...register("bg")} />
            <Input type="text" {...register("bg")} placeholder="#ffffff" />
          </div>
          {errors.bg && <p className="text-sm text-destructive">{errors.bg.message}</p>}
        </Field>

        <Field>
          <FieldLabel>Cor de Superfície (Cards)</FieldLabel>
          <div className="flex gap-2">
            <Input type="color" className="w-12 h-10 p-1 cursor-pointer" {...register("surface")} />
            <Input type="text" {...register("surface")} placeholder="#f3f4f6" />
          </div>
          {errors.surface && <p className="text-sm text-destructive">{errors.surface.message}</p>}
        </Field>

        <Field>
          <FieldLabel>Cor do Texto Principal</FieldLabel>
          <div className="flex gap-2">
            <Input type="color" className="w-12 h-10 p-1 cursor-pointer" {...register("text")} />
            <Input type="text" {...register("text")} placeholder="#000000" />
          </div>
          {errors.text && <p className="text-sm text-destructive">{errors.text.message}</p>}
        </Field>

        <Field>
          <FieldLabel>Cor do Texto Secundário</FieldLabel>
          <div className="flex gap-2">
            <Input type="color" className="w-12 h-10 p-1 cursor-pointer" {...register("textSecondary")} />
            <Input type="text" {...register("textSecondary")} placeholder="#6b7280" />
          </div>
          {errors.textSecondary && <p className="text-sm text-destructive">{errors.textSecondary.message}</p>}
        </Field>

        <Field>
          <FieldLabel>Cor de Destaque</FieldLabel>
          <div className="flex gap-2">
            <Input type="color" className="w-12 h-10 p-1 cursor-pointer" {...register("highlight")} />
            <Input type="text" {...register("highlight")} placeholder="#fbbf24" />
          </div>
          {errors.highlight && <p className="text-sm text-destructive">{errors.highlight.message}</p>}
        </Field>

        <Field>
          <FieldLabel>Cor da Borda</FieldLabel>
          <div className="flex gap-2">
            <Input type="color" className="w-12 h-10 p-1 cursor-pointer" {...register("border")} />
            <Input type="text" {...register("border")} placeholder="#e5e7eb" />
          </div>
          {errors.border && <p className="text-sm text-destructive">{errors.border.message}</p>}
        </Field>

        <Field>
          <FieldLabel>Cor de Hover</FieldLabel>
          <div className="flex gap-2">
            <Input type="color" className="w-12 h-10 p-1 cursor-pointer" {...register("hover")} />
            <Input type="text" {...register("hover")} placeholder="#d1d5db" />
          </div>
          {errors.hover && <p className="text-sm text-destructive">{errors.hover.message}</p>}
        </Field>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={updateThemeMutation.isPending}>
          {updateThemeMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Aparência"
          )}
        </Button>
      </div>
    </form>
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
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${preferences.browserNotifications
                  ? "bg-primary dark:bg-primary shadow-xl shadow-primary/60 dark:shadow-primary/70 border-2 border-primary dark:border-primary ring-2 ring-primary/50 dark:ring-primary/60"
                  : "bg-slate-400 dark:bg-slate-700 border-2 border-slate-500 dark:border-slate-400 shadow-md"
                  }`}
                aria-label={preferences.browserNotifications ? "Desativar notificações no navegador" : "Ativar notificações no navegador"}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full transition-all duration-300 ${preferences.browserNotifications
                    ? "translate-x-6 bg-white dark:bg-white shadow-lg border border-primary/30 dark:border-primary/40"
                    : "translate-x-1 bg-white dark:bg-slate-100 shadow-md border border-slate-400 dark:border-slate-500"
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
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${preferences.emailNotifications
                  ? "bg-primary dark:bg-primary shadow-xl shadow-primary/60 dark:shadow-primary/70 border-2 border-primary dark:border-primary ring-2 ring-primary/50 dark:ring-primary/60"
                  : "bg-slate-400 dark:bg-slate-700 border-2 border-slate-500 dark:border-slate-400 shadow-md"
                  }`}
                aria-label={preferences.emailNotifications ? "Desativar notificações por e-mail" : "Ativar notificações por e-mail"}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full transition-all duration-300 ${preferences.emailNotifications
                    ? "translate-x-6 bg-white dark:bg-white shadow-lg border border-primary/30 dark:border-primary/40"
                    : "translate-x-1 bg-white dark:bg-slate-100 shadow-md border border-slate-400 dark:border-slate-500"
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
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${isEnabled
                      ? "bg-primary dark:bg-primary shadow-xl shadow-primary/60 dark:shadow-primary/70 border-2 border-primary dark:border-primary ring-2 ring-primary/50 dark:ring-primary/60"
                      : "bg-slate-400 dark:bg-slate-700 border-2 border-slate-500 dark:border-slate-400 shadow-md"
                      }`}
                    aria-label={isEnabled ? `Desativar ${type.label.toLowerCase()}` : `Ativar ${type.label.toLowerCase()}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full transition-all duration-300 ${isEnabled
                        ? "translate-x-6 bg-white dark:bg-white shadow-lg border border-primary/30 dark:border-primary/40"
                        : "translate-x-1 bg-white dark:bg-slate-100 shadow-md border border-slate-400 dark:border-slate-500"
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

// Componente de Planos e Assinatura
function SubscriptionPlans() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { selectedStore, isLoading: isLoadingStore } = useSelectedStore();
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "professional" | "enterprise" | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  // Verificar se retornou do checkout
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      showSuccess("Pagamento processado com sucesso! Sua assinatura está ativa.");
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      router.replace("/configuracoes?tab=subscription");
    } else if (canceled === "true") {
      showError("Pagamento cancelado. Você pode tentar novamente quando quiser.");
      router.replace("/configuracoes?tab=subscription");
    }
  }, [searchParams, router, queryClient]);

  const plans = [
    {
      id: "basic" as const,
      name: "Básico",
      price: 49,
      description: "Ideal para começar",
      features: [
        "Até 50 produtos",
        "Catálogo digital",
        "Carrinho WhatsApp",
        "Suporte por email",
        "Sem comissões",
      ],
      icon: Check,
    },
    {
      id: "professional" as const,
      name: "Profissional",
      price: 99,
      description: "Para negócios em crescimento",
      features: [
        "Produtos ilimitados",
        "Catálogo digital",
        "Carrinho WhatsApp",
        "Suporte prioritário",
        "Relatórios de vendas",
        "Sem comissões",
      ],
      popular: true,
      icon: Zap,
    },
    {
      id: "enterprise" as const,
      name: "Enterprise",
      price: 199,
      description: "Para grandes negócios",
      features: [
        "Produtos ilimitados",
        "Múltiplas filiais",
        "Carrinho WhatsApp",
        "Suporte dedicado",
        "API personalizada",
        "Sem comissões",
      ],
      icon: Building2,
    },
  ];

  // Buscar assinatura atual
  const { data: subscriptionData, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: () => subscriptionsService.findByUserId(user!.id),
    enabled: !!user?.id,
  });

  const subscription = subscriptionData?.subscription;
  const currentPlanId = subscription?.planId?.split("-")[0] as "basic" | "professional" | "enterprise" | undefined;

  // Ordem dos planos para comparação
  const planOrder: Record<"basic" | "professional" | "enterprise", number> = {
    basic: 1,
    professional: 2,
    enterprise: 3,
  };

  // Função para determinar o tipo de ação do botão
  const getPlanAction = (planId: "basic" | "professional" | "enterprise") => {
    if (!currentPlanId || subscription?.status !== "PAID") {
      return "assinar";
    }

    if (currentPlanId === planId) {
      return "atual";
    }

    const currentOrder = planOrder[currentPlanId];
    const planOrderValue = planOrder[planId];

    if (planOrderValue > currentOrder) {
      return "upgrade";
    } else {
      return "downgrade";
    }
  };

  // Criar sessão de checkout
  const checkoutMutation = useMutation({
    mutationFn: async (plan: typeof plans[0]) => {
      if (!selectedStore?.id) {
        throw new Error("Loja não selecionada");
      }

      const priceIdMap: Record<typeof plan.id, string> = {
        basic: process.env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID!,
        professional: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
        enterprise: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID!,
      };

      const priceId = priceIdMap[plan.id];

      if (!priceId) {
        throw new Error(`Price ID não configurado para o plano ${plan.name}`);
      }

      const successUrl = `${window.location.origin}/configuracoes?success=true&tab=subscription`;
      const cancelUrl = `${window.location.origin}/configuracoes?canceled=true&tab=subscription`;

      return subscriptionsService.createCheckoutSession({
        storeId: selectedStore.id,
        priceId,
        successUrl,
        cancelUrl,
      });
    },
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: (error: Error) => {
      showError(error.message || "Erro ao iniciar processo de pagamento");
      setSelectedPlan(null);
    },
  });

  // Cancelar assinatura
  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!subscription?.id) {
        throw new Error("Nenhuma assinatura encontrada");
      }
      return subscriptionsService.cancel(subscription.id);
    },
    onSuccess: () => {
      showSuccess("Assinatura cancelada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      router.refresh();
    },
    onError: (error: Error) => {
      showError(error.message || "Erro ao cancelar assinatura");
    },
  });

  const handleSelectPlan = (plan: typeof plans[0]) => {
    const action = getPlanAction(plan.id);

    if (action === "atual") {
      showError("Você já está neste plano");
      return;
    }

    setSelectedPlan(plan.id);
    checkoutMutation.mutate(plan);
  };

  const handleCancelSubscription = () => {
    confirm({
      title: "Cancelar Assinatura",
      description: "Tem certeza que deseja cancelar sua assinatura? Você continuará tendo acesso aos recursos premium até o final do período pago. Após isso, sua loja será migrada para o plano gratuito.",
      confirmText: "Sim, cancelar",
      cancelText: "Não, manter assinatura",
      variant: "destructive",
      onConfirm: () => {
        cancelMutation.mutate();
      },
    });
  };

  if (isLoadingStore) {
    return (
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Planos e Assinatura</h2>
            <p className="text-sm text-muted-foreground">Escolha o plano ideal para o seu negócio</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} className="h-96" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!selectedStore) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Você precisa criar uma loja antes de assinar um plano
          </p>
          <Button asChild>
            <a href="/loja/cadastro">Criar Loja</a>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Planos e Assinatura</h2>
            <p className="text-sm text-muted-foreground">
              Escolha o plano ideal para o seu negócio. Todos os planos incluem suporte e sem comissões.
            </p>
          </div>
        </div>

        {/* Assinatura Atual */}
        {subscription && subscription.status === "PAID" && (
          <Card className="p-6 bg-primary/5 border-primary/20 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">Assinatura Ativa</h3>
                  <Badge variant="default" className="bg-green-600">
                    {plans.find((p) => p.id === currentPlanId)?.name || subscription.planName}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Próximo pagamento: {new Date(subscription.nextPayment || subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                      <span>Cancelando...</span>
                    </>
                  ) : (
                    "Cancelar Assinatura"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentPlanId === plan.id && subscription?.status === "PAID";
            const isSelected = selectedPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={
                  `relative p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`
                }
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500">
                    Mais Popular
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge className="absolute -top-3 right-4 bg-green-600">
                    Plano Atual
                  </Badge>
                )}

                <div className="flex flex-col gap-4 h-full justify-between">
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-2winget upgrade Stripe.Stripe
 mb-2">
                      <div className="p-1 rounded-lg bg-primary/10">
                        <Icon className="size-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Preço */}
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">R$ {plan.price}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrentPlan || checkoutMutation.isPending || isSelected}
                  >
                    {checkoutMutation.isPending && isSelected ? (
                      <>
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                        <span>Processando...</span>
                      </>
                    ) : (() => {
                      const action = getPlanAction(plan.id);
                      switch (action) {
                        case "atual":
                          return (
                            <>
                              <Check className="h-4 w-4 shrink-0" />
                              <span>Plano Atual</span>
                            </>
                          );
                        case "upgrade":
                          return (
                            <>
                              <Zap className="h-4 w-4 shrink-0" />
                              <span>Fazer Upgrade</span>
                            </>
                          );
                        case "downgrade":
                          return (
                            <>
                              <CreditCard className="h-4 w-4 shrink-0" />
                              <span>Fazer Downgrade</span>
                            </>
                          );
                        default:
                          return (
                            <>
                              <CreditCard className="h-4 w-4 shrink-0" />
                              <span>Assinar Agora</span>
                            </>
                          );
                      }
                    })()}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Informações Adicionais */}
        <Card className="p-6 bg-muted/50">
          <h3 className="text-lg font-semibold mb-4">Perguntas Frequentes</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-1">Posso mudar de plano a qualquer momento?</h4>
              <p className="text-muted-foreground">
                Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As alterações serão aplicadas no próximo ciclo de cobrança.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">O que acontece se eu cancelar?</h4>
              <p className="text-muted-foreground">
                Você continuará tendo acesso aos recursos do plano até o final do período pago. Após isso, sua loja será migrada para o plano gratuito.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Como funciona o suporte?</h4>
              <p className="text-muted-foreground">
                O plano Básico inclui suporte por email. Profissional e Enterprise incluem suporte prioritário e dedicado respectivamente.
              </p>
            </div>
          </div>
        </Card>
      </Card>

      {/* Confirm Dialog */}
      {ConfirmDialog}
    </>
  );
}

// Componente de Endereço da Loja
function AddressForm() {
  const { selectedStore } = useSelectedStore();
  const queryClient = useQueryClient();

  const addressSchema = z.object({
    street: z.string().min(1, "Rua é obrigatória").max(255, "Rua deve ter no máximo 255 caracteres"),
    number: z.string().min(1, "Número é obrigatório").max(10, "Número deve ter no máximo 10 caracteres"),
    complement: z.string().max(255, "Complemento deve ter no máximo 255 caracteres").optional().or(z.literal("")),
    neighborhood: z.string().min(1, "Bairro é obrigatório").max(100, "Bairro deve ter no máximo 100 caracteres"),
    cityId: z.string().uuid("Cidade é obrigatória"),
    zipCode: z.string().length(8, "CEP deve ter 8 caracteres").regex(/^\d+$/, "CEP deve conter apenas números"),
    country: z.string().min(1, "País é obrigatório").max(50, "País deve ter no máximo 50 caracteres"),
  });

  type AddressFormData = z.infer<typeof addressSchema>;

  // Buscar cidades
  const { data: citiesData, isLoading: isLoadingCities } = useQuery({
    queryKey: ["cities"],
    queryFn: () => citiesService.findAll(),
    staleTime: 1000 * 60 * 60,
  });

  const cities = citiesData?.cities || [];
  const [selectedState, setSelectedState] = useState("");

  const uniqueStates = useMemo(() => {
    return cities.reduce((acc: string[], city) => {
      if (!acc.includes(city.state)) {
        acc.push(city.state);
      }
      return acc;
    }, []).sort();
  }, [cities]);

  const filteredCities = useMemo(() => {
    return cities.filter(city => city.state === selectedState).sort((a, b) => a.name.localeCompare(b.name));
  }, [cities, selectedState]);

  // Buscar endereço da loja
  const { data: addressesData, isLoading: isLoadingAddress } = useQuery({
    queryKey: ["addresses", selectedStore?.id],
    queryFn: async () => {
      if (!selectedStore?.id) return null;
      const response = await addressesService.findAll({ limit: 100 });
      // Filtrar endereços da loja e pegar o principal ou o primeiro
      const storeAddresses = response.addresses.filter(addr => addr.storeId === selectedStore.id);
      return storeAddresses.find(addr => addr.isMain) || storeAddresses[0] || null;
    },
    enabled: !!selectedStore?.id,
  });

  const storeAddress = addressesData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      cityId: "",
      zipCode: "",
      country: "Brasil",
    },
  });

  const watchedCityId = watch("cityId");

  // Atualizar estado quando cidade for selecionada
  useEffect(() => {
    if (watchedCityId) {
      const city = cities.find(c => c.id === watchedCityId);
      if (city) {
        setSelectedState(city.state);
      }
    }
  }, [watchedCityId, cities]);

  // Carregar dados do endereço quando disponível
  useEffect(() => {
    if (storeAddress) {
      reset({
        street: storeAddress.street,
        number: storeAddress.number,
        complement: storeAddress.complement || "",
        neighborhood: storeAddress.neighborhood,
        cityId: storeAddress.cityId,
        zipCode: storeAddress.zipCode,
        country: storeAddress.country,
      });
      const city = cities.find(c => c.id === storeAddress.cityId);
      if (city) {
        setSelectedState(city.state);
      }
    }
  }, [storeAddress, reset, cities]);

  const createAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      if (!selectedStore?.id) throw new Error("Loja não selecionada");
      return addressesService.create({
        ...data,
        storeId: selectedStore.id,
        isMain: true,
        complement: data.complement || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      showSuccess("Endereço criado com sucesso!");
    },
    onError: (error: Error) => {
      showError(error.message || "Erro ao criar endereço");
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      if (!storeAddress?.id) throw new Error("Endereço não encontrado");
      return addressesService.update(storeAddress.id, {
        ...data,
        complement: data.complement || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      showSuccess("Endereço atualizado com sucesso!");
    },
    onError: (error: Error) => {
      showError(error.message || "Erro ao atualizar endereço");
    },
  });

  const onSubmit = (data: AddressFormData) => {
    if (storeAddress) {
      updateAddressMutation.mutate(data);
    } else {
      createAddressMutation.mutate(data);
    }
  };

  // Formatar CEP
  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
    setValue("zipCode", value);
  };

  if (!selectedStore) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">
          Você precisa criar uma loja antes de configurar o endereço
        </p>
        <Button asChild>
          <a href="/loja/cadastro">Criar Loja</a>
        </Button>
      </div>
    );
  }

  if (isLoadingAddress || isLoadingCities) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Endereço da Loja</h2>
            <p className="text-sm text-muted-foreground">Configure o endereço completo da sua loja</p>
          </div>
        </div>
        <SkeletonCard className="h-96" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6 pb-6 border-b">
        <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Endereço da Loja</h2>
          <p className="text-sm text-muted-foreground">Configure o endereço completo da sua loja</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
        <FieldGroup>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel htmlFor="zipCode">CEP *</FieldLabel>
              <Input
                id="zipCode"
                {...register("zipCode")}
                onChange={handleZipCodeChange}
                placeholder="00000000"
                maxLength={8}
                aria-invalid={errors.zipCode ? "true" : "false"}
              />
              {errors.zipCode && (
                <p className="text-sm text-destructive mt-1">
                  {errors.zipCode.message}
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="country">País *</FieldLabel>
              <Input
                id="country"
                {...register("country")}
                aria-invalid={errors.country ? "true" : "false"}
              />
              {errors.country && (
                <p className="text-sm text-destructive mt-1">
                  {errors.country.message}
                </p>
              )}
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="street">Rua *</FieldLabel>
            <Input
              id="street"
              {...register("street")}
              placeholder="Nome da rua"
              aria-invalid={errors.street ? "true" : "false"}
            />
            {errors.street && (
              <p className="text-sm text-destructive mt-1">
                {errors.street.message}
              </p>
            )}
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field>
              <FieldLabel htmlFor="number">Número *</FieldLabel>
              <Input
                id="number"
                {...register("number")}
                placeholder="123"
                aria-invalid={errors.number ? "true" : "false"}
              />
              {errors.number && (
                <p className="text-sm text-destructive mt-1">
                  {errors.number.message}
                </p>
              )}
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="complement">Complemento</FieldLabel>
              <Input
                id="complement"
                {...register("complement")}
                placeholder="Apartamento, bloco, etc. (opcional)"
                aria-invalid={errors.complement ? "true" : "false"}
              />
              {errors.complement && (
                <p className="text-sm text-destructive mt-1">
                  {errors.complement.message}
                </p>
              )}
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="neighborhood">Bairro *</FieldLabel>
            <Input
              id="neighborhood"
              {...register("neighborhood")}
              placeholder="Nome do bairro"
              aria-invalid={errors.neighborhood ? "true" : "false"}
            />
            {errors.neighborhood && (
              <p className="text-sm text-destructive mt-1">
                {errors.neighborhood.message}
              </p>
            )}
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel htmlFor="state">Estado *</FieldLabel>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!selectedState && (
                <p className="text-sm text-destructive mt-1">
                  Selecione um estado
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="cityId">Cidade *</FieldLabel>
              <Select
                value={watch("cityId")}
                onValueChange={(value) => setValue("cityId", value)}
                disabled={!selectedState}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedState ? "Selecione a cidade" : "Selecione o estado primeiro"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredCities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.cityId && (
                <p className="text-sm text-destructive mt-1">
                  {errors.cityId.message}
                </p>
              )}
            </Field>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="submit"
              disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
            >
              {(createAddressMutation.isPending || updateAddressMutation.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  {storeAddress ? "Atualizar Endereço" : "Salvar Endereço"}
                </>
              )}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </>
  );
}

