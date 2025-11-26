"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { subscriptionsService } from "@/services/subscriptions-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Check, 
  X, 
  CreditCard, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Receipt
} from "lucide-react";
import { showSuccess, showError } from "@/lib/toast";
import { useRouter } from "next/navigation";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useConfirm } from "@/hooks/use-confirm";
import { Separator } from "@/components/ui/separator";

export default function SubscriptionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { confirm, ConfirmDialog } = useConfirm();

  // Buscar assinatura atual do usuário
  const { data: subscriptionData, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user?.id) return { subscription: null };
      // TODO: Atualizar para usar findByUserId quando o serviço for atualizado
      // Por enquanto, pode precisar ajustar conforme a implementação atual
      const response = await fetch(`/api/subscriptions/user/${user.id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        return { subscription: null };
      }
      return response.json();
    },
    enabled: !!user?.id,
  });

  const subscription = subscriptionData?.subscription;

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Ativa
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="outline" className="border-red-500 text-red-600">
            <X className="h-3 w-3 mr-1" />
            Cancelada
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            Desconhecido
          </Badge>
        );
    }
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoadingSubscription) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Minha Assinatura</h1>
          <p className="text-muted-foreground">Gerencie sua assinatura e pagamentos</p>
        </div>
        <SkeletonCard className="h-64" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Minha Assinatura</h1>
          <p className="text-muted-foreground">Gerencie sua assinatura e pagamentos</p>
        </div>
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Nenhuma assinatura ativa</h3>
              <p className="text-muted-foreground mb-6">
                Você ainda não possui uma assinatura ativa. Assine um plano para começar a usar todos os recursos premium.
              </p>
              <Button onClick={() => router.push("/planos")}>
                Ver Planos
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 page-transition">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Minha Assinatura</h1>
        <p className="text-muted-foreground">
          Gerencie sua assinatura, pagamentos e histórico
        </p>
      </div>

      {/* Assinatura Atual */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">Assinatura Atual</h2>
              {getStatusBadge(subscription.status)}
            </div>
            <p className="text-muted-foreground">
              Plano: <span className="font-semibold text-foreground">{subscription.planName}</span>
            </p>
          </div>
          {subscription.status === "PAID" && (
            <Button
              variant="outline"
              onClick={handleCancelSubscription}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar Assinatura
                </>
              )}
            </Button>
          )}
        </div>

        <Separator className="my-6" />

        {/* Informações da Assinatura */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Valor</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(subscription.price)}</p>
            <p className="text-xs text-muted-foreground mt-1">por mês</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Período Atual</span>
            </div>
            <p className="text-lg font-semibold">
              {formatDate(subscription.currentPeriodStart)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">até {formatDate(subscription.currentPeriodEnd)}</p>
          </div>

          {subscription.nextPayment && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Próximo Pagamento</span>
              </div>
              <p className="text-lg font-semibold">
                {formatDate(subscription.nextPayment)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Data de cobrança</p>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Provedor</span>
            </div>
            <p className="text-lg font-semibold capitalize">{subscription.provider}</p>
            <p className="text-xs text-muted-foreground mt-1">Método de pagamento</p>
          </div>
        </div>
      </Card>

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detalhes do Plano */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Detalhes do Plano</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">ID do Plano</p>
              <p className="font-mono text-sm">{subscription.planId}</p>
            </div>
            {subscription.stripeSubscriptionId && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">ID da Assinatura Stripe</p>
                <p className="font-mono text-sm break-all">{subscription.stripeSubscriptionId}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">Criada em</p>
              <p className="text-sm">{formatDate(subscription.createdAt)}</p>
            </div>
          </div>
        </Card>

        {/* Ações Rápidas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/planos")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Alterar Plano
            </Button>
            {subscription.provider === "stripe" && subscription.stripeSubscriptionId && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  window.open("https://billing.stripe.com/p/login", "_blank");
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Gerenciar no Stripe
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/configuracoes")}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Configurações de Pagamento
            </Button>
          </div>
        </Card>
      </div>

      {/* Informações Importantes */}
      <Card className="p-6 bg-muted/50">
        <h3 className="text-lg font-semibold mb-4">Informações Importantes</h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium mb-1 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Cancelamento
            </h4>
            <p className="text-muted-foreground">
              Ao cancelar sua assinatura, você continuará tendo acesso aos recursos premium até o final do período pago. Após isso, sua loja será migrada para o plano gratuito.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Renovação Automática
            </h4>
            <p className="text-muted-foreground">
              Sua assinatura é renovada automaticamente no final de cada período. Você será cobrado automaticamente usando o método de pagamento cadastrado.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1 flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Faturas
            </h4>
            <p className="text-muted-foreground">
              Todas as faturas são enviadas por email. Você também pode acessar seu histórico de pagamentos através do portal do provedor de pagamento.
            </p>
          </div>
        </div>
      </Card>

      {/* Confirm Dialog */}
      {ConfirmDialog}
    </div>
  );
}
