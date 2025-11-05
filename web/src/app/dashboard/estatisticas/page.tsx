"use client";

import { useQuery } from "@tanstack/react-query";
import { storesService } from "@/services/stores-service";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, Package, DollarSign, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";

const statusLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  CONFIRMADO: "Confirmado",
  PREPARANDO: "Preparando",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

const statusIcons: Record<string, typeof Package> = {
  PENDENTE: Clock,
  CONFIRMADO: CheckCircle2,
  PREPARANDO: Package,
  ENVIADO: Truck,
  ENTREGUE: CheckCircle2,
  CANCELADO: XCircle,
};

export default function StatisticsPage() {
  const { user } = useAuth();

  // Get user's store
  const { data: storesData, isLoading: isLoadingStores } = useQuery({
    queryKey: ["stores", "user", user?.id],
    queryFn: () => storesService.findAll(),
    enabled: !!user,
  });

  const userStore = storesData?.stores.find(
    (store) => store.ownerId === user?.id,
  );

  // Get statistics
  const { data: statistics, isLoading: isLoadingStats } = useQuery({
    queryKey: ["statistics", userStore?.id],
    queryFn: () => storesService.getStatistics(userStore!.id),
    enabled: !!userStore?.id,
  });

  if (isLoadingStores || isLoadingStats) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userStore) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Estatísticas</h1>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Você precisa criar uma loja para visualizar estatísticas.
          </p>
        </Card>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Estatísticas</h1>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma estatística disponível.</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Estatísticas</h1>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total de Pedidos</p>
              <p className="text-3xl font-bold">{statistics.totalOrders}</p>
            </div>
            <Package className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
              <p className="text-3xl font-bold">
                R$ {(statistics.totalRevenue / 100).toFixed(2).replace(".", ",")}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pedidos (7 dias)</p>
              <p className="text-3xl font-bold">{statistics.ordersLast7Days}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Receita (7 dias)</p>
              <p className="text-3xl font-bold">
                R$ {(statistics.revenueLast7Days / 100).toFixed(2).replace(".", ",")}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Estatísticas por Período */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Últimos 7 Dias</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pedidos</span>
              <span className="font-semibold">{statistics.ordersLast7Days}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Receita</span>
              <span className="font-semibold">
                R$ {(statistics.revenueLast7Days / 100).toFixed(2).replace(".", ",")}
              </span>
            </div>
            {statistics.ordersLast7Days > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ticket Médio</span>
                <span className="font-semibold">
                  R$ {((statistics.revenueLast7Days / statistics.ordersLast7Days) / 100).toFixed(2).replace(".", ",")}
                </span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Últimos 30 Dias</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Pedidos</span>
              <span className="font-semibold">{statistics.ordersLast30Days}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Receita</span>
              <span className="font-semibold">
                R$ {(statistics.revenueLast30Days / 100).toFixed(2).replace(".", ",")}
              </span>
            </div>
            {statistics.ordersLast30Days > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Ticket Médio</span>
                <span className="font-semibold">
                  R$ {((statistics.revenueLast30Days / statistics.ordersLast30Days) / 100).toFixed(2).replace(".", ",")}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Pedidos por Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Pedidos por Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(statistics.ordersByStatus).map(([status, count]) => {
            const StatusIcon = statusIcons[status] || Package;
            return (
              <div key={status} className="flex flex-col items-center p-4 bg-muted rounded-lg">
                <StatusIcon className="h-6 w-6 text-primary mb-2" />
                <p className="text-sm text-muted-foreground mb-1">
                  {statusLabels[status]}
                </p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

