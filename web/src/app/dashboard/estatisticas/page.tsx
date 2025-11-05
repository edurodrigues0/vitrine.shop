"use client";

import { useQuery } from "@tanstack/react-query";
import { storesService } from "@/services/stores-service";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Loader2, TrendingUp, Package, DollarSign, Clock, CheckCircle2, Truck, XCircle, Eye } from "lucide-react";

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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Estatísticas</h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho e crescimento da sua loja
        </p>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg bg-blue-500/10 dark:bg-blue-500/20`}>
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total de Pedidos</p>
            <p className="text-3xl font-bold">{statistics.totalOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">Todos os tempos</p>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg bg-green-500/10 dark:bg-green-500/20`}>
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              R$ {(statistics.totalRevenue / 100).toFixed(2).replace(".", ",")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Todos os tempos</p>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg bg-purple-500/10 dark:bg-purple-500/20`}>
              <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total de Visitas</p>
            <p className="text-3xl font-bold">{statistics.totalVisits || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Todos os tempos</p>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg bg-orange-500/10 dark:bg-orange-500/20`}>
              <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Visitas (7 dias)</p>
            <p className="text-3xl font-bold">{statistics.visitsLast7Days || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Última semana</p>
          </div>
        </Card>
      </div>

      {/* Estatísticas por Período */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold">Últimos 7 Dias</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Pedidos</span>
              <span className="font-semibold text-lg">{statistics.ordersLast7Days}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Receita</span>
              <span className="font-semibold text-lg text-green-600 dark:text-green-400">
                R$ {(statistics.revenueLast7Days / 100).toFixed(2).replace(".", ",")}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Visitas</span>
              <span className="font-semibold text-lg">{statistics.visitsLast7Days || 0}</span>
            </div>
            {statistics.ordersLast7Days > 0 && (
              <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                <span className="text-muted-foreground">Ticket Médio</span>
                <span className="font-semibold text-lg text-primary">
                  R$ {((statistics.revenueLast7Days / statistics.ordersLast7Days) / 100).toFixed(2).replace(".", ",")}
                </span>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold">Últimos 30 Dias</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Pedidos</span>
              <span className="font-semibold text-lg">{statistics.ordersLast30Days}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Receita</span>
              <span className="font-semibold text-lg text-green-600 dark:text-green-400">
                R$ {(statistics.revenueLast30Days / 100).toFixed(2).replace(".", ",")}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-muted-foreground">Visitas</span>
              <span className="font-semibold text-lg">{statistics.visitsLast30Days || 0}</span>
            </div>
            {statistics.ordersLast30Days > 0 && (
              <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                <span className="text-muted-foreground">Ticket Médio</span>
                <span className="font-semibold text-lg text-primary">
                  R$ {((statistics.revenueLast30Days / statistics.ordersLast30Days) / 100).toFixed(2).replace(".", ",")}
                </span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Pedidos por Status */}
      <Card className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Pedidos por Status</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(statistics.ordersByStatus).map(([status, count]) => {
            const StatusIcon = statusIcons[status] || Package;
            const statusColors: Record<string, string> = {
              PENDENTE: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
              CONFIRMADO: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
              PREPARANDO: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
              ENVIADO: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
              ENTREGUE: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
              CANCELADO: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
            };
            return (
              <Card key={status} className={`p-4 ${statusColors[status] || statusColors.PENDENTE} border`}>
                <div className="flex flex-col items-center">
                  <StatusIcon className="h-6 w-6 mb-2" />
                  <p className="text-xs text-muted-foreground mb-1 text-center">
                    {statusLabels[status]}
                  </p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

