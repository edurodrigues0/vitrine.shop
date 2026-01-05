"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelectedStore } from "@/hooks/use-selected-store";
import { useAuth } from "@/hooks/use-auth";
import { subscriptionsService } from "@/services/subscriptions-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Sparkles, Zap, Building2, CreditCard } from "lucide-react";
import { showSuccess, showError } from "@/lib/toast";
import { useRouter, useSearchParams } from "next/navigation";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useConfirm } from "@/hooks/use-confirm";

export type PlanId = "basic" | "professional" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  priceId?: string; // Stripe Price ID
  icon: typeof Check;
}

const plans: Plan[] = [
  {
    id: "basic",
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
    id: "professional",
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
    id: "enterprise",
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

export default function PlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { selectedStore, isLoading: isLoadingStore } = useSelectedStore();
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  // Verificar se retornou do checkout
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      showSuccess("Pagamento processado com sucesso! Sua assinatura está ativa.");
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      router.replace("/planos");
    } else if (canceled === "true") {
      showError("Pagamento cancelado. Você pode tentar novamente quando quiser.");
      router.replace("/planos");
    }
  }, [searchParams, router, queryClient]);

  // Buscar assinatura atual
  const { data: subscriptionData, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: () => subscriptionsService.findByUserId(user!.id),
    enabled: !!user?.id,
  });

  const subscription = subscriptionData?.subscription;
  const currentPlanId = subscription?.planId?.split("-")[0] as PlanId | undefined;

  // Criar sessão de checkout
  const checkoutMutation = useMutation({
    mutationFn: async (plan: Plan) => {
      if (!selectedStore?.id) {
        throw new Error("Loja não selecionada");
      }

      // TODO: Obter priceId do Stripe baseado no plano
      // Por enquanto, vamos usar um mock - estes devem ser substituídos pelos IDs reais do Stripe
      const priceIdMap: Record<PlanId, string> = {
        basic: process.env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID!,
        professional: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
        enterprise: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID!,
      };

      const priceId = plan.priceId || priceIdMap[plan.id];

      if (!priceId) {
        throw new Error(`Price ID não configurado para o plano ${plan.name}`);
      }

      const successUrl = `${window.location.origin}/planos?success=true`;
      const cancelUrl = `${window.location.origin}/planos?canceled=true`;

      return subscriptionsService.createCheckoutSession({
        storeId: selectedStore.id,
        priceId,
        successUrl,
        cancelUrl,
      });
    },
    onSuccess: (data) => {
      // Redirecionar para o checkout do Stripe
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

  const handleSelectPlan = (plan: Plan) => {
    if (currentPlanId === plan.id) {
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
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Planos e Assinatura</h1>
          <p className="text-muted-foreground">Escolha o plano ideal para o seu negócio</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Planos e Assinatura</h1>
          <p className="text-muted-foreground">Você precisa criar uma loja antes de assinar um plano</p>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Crie uma loja para começar a usar nossos planos
          </p>
          <Button asChild>
            <a href="/loja/cadastro">Criar Loja</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 page-transition">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Planos e Assinatura</h1>
        <p className="text-muted-foreground">
          Escolha o plano ideal para o seu negócio. Todos os planos incluem suporte e sem comissões.
        </p>
      </div>

      {/* Assinatura Atual */}
      {subscription && subscription.status === "PAID" && (
        <Card className="p-6 bg-primary/5 border-primary/20">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlanId === plan.id && subscription?.status === "PAID";
          const isSelected = selectedPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={`relative p-6 transition-all duration-300 flex flex-col h-full ${
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

              <div className="flex flex-col h-full space-y-4">
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
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className="w-full mt-auto"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrentPlan || checkoutMutation.isPending || isSelected}
                >
                  {checkoutMutation.isPending && isSelected ? (
                    <>
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : isCurrentPlan ? (
                    <>
                      <Check className="h-4 w-4 shrink-0" />
                      <span>Plano Atual</span>
                    </>
                  ) : plan.id === "enterprise" ? (
                    <>
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span>Falar com vendas</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 shrink-0" />
                      <span>Assinar agora</span>
                    </>
                  )}
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

      {/* Confirm Dialog */}
      {ConfirmDialog}
    </div>
  );
}

