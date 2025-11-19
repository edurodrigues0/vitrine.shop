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
import { Loader2, User, Lock, Bell, Palette, ShoppingBag, Package, Eye, Store, AlertTriangle, Info, CreditCard } from "lucide-react";
import { showError, showSuccess } from "@/lib/toast";
import { useState, useEffect } from "react";
import { useSelectedStore } from "@/hooks/use-selected-store";
import { subscriptionsService } from "@/services/subscriptions-service";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Building2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useConfirm } from "@/hooks/use-confirm";

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
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "notifications" | "subscription">("profile");

  // Verificar se há uma aba específica na URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "subscription") {
      setActiveTab("subscription");
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
              <button
                onClick={() => setActiveTab("subscription")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  activeTab === "subscription"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-accent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">Planos e Assinatura</span>
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

          {activeTab === "subscription" && (
            <SubscriptionPlans />
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
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                  preferences.browserNotifications 
                    ? "bg-primary dark:bg-primary shadow-xl shadow-primary/60 dark:shadow-primary/70 border-2 border-primary dark:border-primary ring-2 ring-primary/50 dark:ring-primary/60" 
                    : "bg-slate-400 dark:bg-slate-700 border-2 border-slate-500 dark:border-slate-400 shadow-md"
                }`}
                aria-label={preferences.browserNotifications ? "Desativar notificações no navegador" : "Ativar notificações no navegador"}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full transition-all duration-300 ${
                    preferences.browserNotifications 
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
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                  preferences.emailNotifications 
                    ? "bg-primary dark:bg-primary shadow-xl shadow-primary/60 dark:shadow-primary/70 border-2 border-primary dark:border-primary ring-2 ring-primary/50 dark:ring-primary/60" 
                    : "bg-slate-400 dark:bg-slate-700 border-2 border-slate-500 dark:border-slate-400 shadow-md"
                }`}
                aria-label={preferences.emailNotifications ? "Desativar notificações por e-mail" : "Ativar notificações por e-mail"}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full transition-all duration-300 ${
                    preferences.emailNotifications 
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
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                      isEnabled 
                        ? "bg-primary dark:bg-primary shadow-xl shadow-primary/60 dark:shadow-primary/70 border-2 border-primary dark:border-primary ring-2 ring-primary/50 dark:ring-primary/60" 
                        : "bg-slate-400 dark:bg-slate-700 border-2 border-slate-500 dark:border-slate-400 shadow-md"
                    }`}
                    aria-label={isEnabled ? `Desativar ${type.label.toLowerCase()}` : `Ativar ${type.label.toLowerCase()}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full transition-all duration-300 ${
                        isEnabled 
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
    queryKey: ["subscription", selectedStore?.id],
    queryFn: () => subscriptionsService.findByStoreId(selectedStore!.id),
    enabled: !!selectedStore?.id,
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
        basic: "price_basic_monthly",
        professional: "price_professional_monthly",
        enterprise: "price_enterprise_monthly",
      };

      const priceId = plan.priceId || priceIdMap[plan.id];

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
                className={`relative p-6 transition-all duration-300 ${
                  plan.popular
                    ? "border-primary border-2 shadow-lg scale-105"
                    : "hover:shadow-lg hover:scale-105"
                } ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Mais Popular
                  </Badge>
                )}
                {isCurrentPlan && (
                  <Badge className="absolute -top-3 right-4 bg-green-600">
                    Plano Atual
                  </Badge>
                )}

                <div className="space-y-4">
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Preço */}
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">R$ {plan.price}</span>
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

