"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { storesService } from "@/services/stores-service";
import { analyticsService } from "@/services/analytics-service";
import { useSelectedStore } from "@/hooks/use-selected-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chart } from "@/components/ui/chart";
import { Loader2, TrendingUp, Package, DollarSign, Clock, CheckCircle2, Truck, XCircle, Eye, Calendar, Users, AlertCircle } from "lucide-react";
import { format, subDays } from "date-fns";

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

type Period = "7" | "30" | "90" | "custom";
type GroupBy = "day" | "week" | "month";

export default function StatisticsPage() {
  const { selectedStore, isLoading: isLoadingStore } = useSelectedStore();
  const [period, setPeriod] = useState<Period>("30");
  const [groupBy, setGroupBy] = useState<GroupBy>("day");
  const [customStartDate, setCustomStartDate] = useState<string>(
    format(subDays(new Date(), 30), "yyyy-MM-dd"),
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );

  const getDateRange = () => {
    const end = new Date();
    let start: Date;

    if (period === "custom") {
      start = new Date(customStartDate);
      end.setTime(new Date(customEndDate).getTime());
    } else {
      const days = parseInt(period, 10);
      start = subDays(end, days);
    }

    return {
      start: format(start, "yyyy-MM-dd"),
      end: format(end, "yyyy-MM-dd"),
    };
  };

  const dateRange = getDateRange();

  // Get statistics
  const { data: statistics, isLoading: isLoadingStats } = useQuery({
    queryKey: ["statistics", selectedStore?.id],
    queryFn: () => storesService.getStatistics(selectedStore!.id),
    enabled: !!selectedStore?.id,
  });

  // Get sales analytics for charts
  const { data: salesData, isLoading: isLoadingSales } = useQuery({
    queryKey: ["analytics", "sales", selectedStore?.id, dateRange, groupBy],
    queryFn: () =>
      analyticsService.getSales(selectedStore!.id, {
        ...dateRange,
        groupBy,
      }),
    enabled: !!selectedStore?.id,
  });

  // Get products analytics
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["analytics", "products", selectedStore?.id, dateRange],
    queryFn: () =>
      analyticsService.getProducts(selectedStore!.id, {
        ...dateRange,
        limit: 10,
      }),
    enabled: !!selectedStore?.id,
  });

  // Get customers analytics
  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["analytics", "customers", selectedStore?.id, dateRange],
    queryFn: () =>
      analyticsService.getCustomers(selectedStore!.id, {
        ...dateRange,
      }),
    enabled: !!selectedStore?.id,
  });

  const isLoadingAny = isLoadingStore || isLoadingStats || isLoadingSales || isLoadingProducts || isLoadingCustomers;

  if (isLoadingAny) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!selectedStore) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Estatísticas e Relatórios</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho, crescimento e análises detalhadas da sua loja
          </p>
        </div>
      </div>

      {/* Filtros de Período */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">Período:</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant={period === "7" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("7")}
            >
              7 dias
            </Button>
            <Button
              variant={period === "30" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("30")}
            >
              30 dias
            </Button>
            <Button
              variant={period === "90" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("90")}
            >
              90 dias
            </Button>
            <Button
              variant={period === "custom" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("custom")}
            >
              Personalizado
            </Button>
          </div>

          {period === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              />
              <span className="text-muted-foreground">até</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              />
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-medium">Agrupar por:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
            >
              <option value="day">Dia</option>
              <option value="week">Semana</option>
              <option value="month">Mês</option>
            </select>
          </div>
        </div>
      </Card>

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

      {/* Gráfico de Vendas */}
      {salesData && salesData.sales.length > 0 && (
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Vendas ao Longo do Tempo</h2>
          </div>
          <Chart
            type="line"
            data={salesData.sales.map((item) => ({
              name: item.date,
              value: item.revenue / 100,
              orders: item.orders,
            }))}
            dataKey="value"
            nameKey="name"
            height={350}
          />
        </Card>
      )}

      {/* Análises Avançadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos Mais Vendidos */}
        {productsData && productsData.topProducts.length > 0 && (
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold">Produtos Mais Vendidos</h2>
            </div>
            <Chart
              type="bar"
              data={productsData.topProducts.map((item) => ({
                name: item.productName,
                Quantidade: item.quantitySold,
                Receita: item.revenue / 100,
              }))}
              dataKey="Quantidade"
              nameKey="name"
              height={300}
              fillColor="hsl(var(--green-500))"
            />
          </Card>
        )}

        {/* Top Clientes */}
        {customersData && customersData.topCustomers.length > 0 && (
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold">Top Clientes</h2>
            </div>
            <div className="space-y-4">
              {customersData.topCustomers.slice(0, 5).map((customer, index) => (
                <div
                  key={`customer-${index}-${customer.customerPhone}-${customer.customerName}`}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{customer.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.orderCount} pedido{customer.orderCount > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600 dark:text-green-400">
                      R$ {(customer.totalSpent / 100).toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ticket médio: R${" "}
                      {(customer.averageTicket / 100).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Métricas de Clientes */}
      {customersData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold">Clientes Únicos</h3>
            </div>
            <p className="text-3xl font-bold">
              {customersData.uniqueCustomers || 0}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {customersData.recurringCustomers || 0} clientes recorrentes
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold">Ticket Médio</h3>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              R${" "}
              {customersData
                ? (customersData.averageTicket / 100).toFixed(2).replace(".", ",")
                : "0,00"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Média por pedido
            </p>
          </Card>

          {productsData && (
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <h3 className="font-semibold">Produtos sem Estoque</h3>
              </div>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {productsData.outOfStockProducts.length || 0}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Requerem atenção
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Produtos sem estoque */}
      {productsData && productsData.outOfStockProducts.length > 0 && (
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-red-500/10 dark:bg-red-500/20">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold">Produtos Sem Estoque</h2>
          </div>
          <ul className="space-y-2">
            {productsData.outOfStockProducts.map((product) => (
              <li key={product.productId} className="flex items-center justify-between rounded-md bg-muted p-3">
                <span className="text-sm font-medium">{product.productName}</span>
                <span className="text-sm text-red-500">0 em estoque</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

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

