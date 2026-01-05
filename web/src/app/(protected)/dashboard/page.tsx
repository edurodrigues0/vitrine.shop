"use client";

import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products-service";
import { useSelectedStore } from "@/hooks/use-selected-store";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  Package, 
  TrendingUp, 
  Users, 
  Loader2, 
  Plus, 
  Edit, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  ShoppingBag
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ActivityTimeline } from "@/components/activity-timeline";

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { selectedStore, isLoading: isLoadingStore } = useSelectedStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Get products for selected store
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", "store", selectedStore?.id],
    queryFn: () => {
      if (!selectedStore?.id) {
        return Promise.resolve([]);
      }
      return productsService.findByStoreId(selectedStore.id);
    },
    enabled: !!selectedStore?.id,
  });

  // Ensure products is always an array
  const products = Array.isArray(productsData) ? productsData : [];

  const isLoading = isLoadingStore || isLoadingProducts;

  const stats = [
    {
      label: "Minha Loja",
      value: selectedStore ? "Ativa" : "Não configurada",
      icon: Store,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
      description: selectedStore ? "Loja configurada e ativa" : "Configure sua loja",
    },
    {
      label: "Produtos",
      value: isLoadingProducts ? "..." : products.length.toString(),
      icon: Package,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10 dark:bg-green-500/20",
      description: "Total de produtos cadastrados",
    },
    {
      label: "Vendas",
      value: "0",
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
      description: "Total de vendas realizadas",
    },
    {
      label: "Clientes",
      value: "0",
      icon: Users,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/10 dark:bg-orange-500/20",
      description: "Total de clientes",
    },
  ];

  const quickActions = [
    {
      title: "Adicionar novo produto",
      description: "Cadastre um novo produto na sua loja",
      href: "/produtos/cadastro",
      icon: Plus,
      color: "text-primary",
    },
    {
      title: "Gerenciar loja",
      description: "Edite informações e configurações da sua loja",
      href: "/loja",
      icon: Edit,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Ver estatísticas",
      description: "Acompanhe o desempenho da sua loja",
      href: "/estatisticas",
      icon: BarChart3,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Ver pedidos",
      description: "Gerencie os pedidos recebidos",
      href: "/pedidos",
      icon: ShoppingBag,
      color: "text-green-600 dark:text-green-400",
    },
  ];

  // Mostrar loading apenas após montagem para evitar mismatch de hidratação
  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao painel de controle da sua loja
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6 hover:shadow-lg transition-all duration-200 hover:border-border/60 dark:hover:border-border">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                {stat.label === "Minha Loja" && selectedStore && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Ativa
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ações Rápidas
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-lg"
                >
                  <div className="p-4 rounded-lg border hover:border-primary/50 hover:bg-[hsl(var(--feedback-hover-surface))] transition-all cursor-pointer hovelift">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors`}>
                        <Icon className={`h-5 w-5 ${action.color}`} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Informações
          </h2>
          <div className="space-y-4 flex flex-1 flex-col">
            {isLoadingStore ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
              </div>
            ) : selectedStore ? (
              <div className="h-full flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span>Sua loja está configurada</span>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm font-medium mb-1">{selectedStore.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {products.length} {products.length === 1 ? "produto" : "produtos"} cadastrado{products.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/loja" className="flex items-center justify-center gap-2 whitespace-nowrap">
                    <Edit className="h-4 w-4 shrink-0" />
                    <span>Gerenciar Loja</span>
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">
                      Configure sua loja
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Crie sua loja para começar a vender produtos.
                    </p>
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link href="/loja/cadastro" className="flex items-center justify-center gap-2 whitespace-nowrap">
                    <Store className="h-4 w-4 shrink-0" />
                    <span>Criar Loja</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Activity Timeline */}
      <ActivityTimeline defaultLimit={10} defaultDays={7} showFilters={true} />
    </div>
  );
}

