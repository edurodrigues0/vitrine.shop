"use client";

import { useQuery } from "@tanstack/react-query";
import { storesService } from "@/services/stores-service";
import { productsService } from "@/services/products-service";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Store, Package, TrendingUp, Users, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading: isLoadingUser } = useAuth();

  // Get user's store
  const { data: storesData, isLoading: isLoadingStores } = useQuery({
    queryKey: ["stores", "user", user?.id],
    queryFn: () =>
      storesService.findAll({
        // We'll need to filter by ownerId in the future
      }),
    enabled: !!user?.id,
  });

  const userStore = storesData?.stores?.find(
    (store) => store.ownerId === user?.id,
  );

  // Get products for user's store
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", "store", userStore?.id],
    queryFn: () => {
      if (!userStore?.id) {
        return Promise.resolve([]);
      }
      return productsService.findByStoreId(userStore.id);
    },
    enabled: !!userStore?.id,
  });

  // Ensure products is always an array
  const products = Array.isArray(productsData) ? productsData : [];

  const isLoading = isLoadingUser || isLoadingStores || isLoadingProducts;

  const stats = [
    {
      label: "Minha Loja",
      value: userStore ? "Ativa" : "Não configurada",
      icon: Store,
      color: "text-blue-600",
    },
    {
      label: "Produtos",
      value: isLoadingProducts ? "..." : products.length.toString(),
      icon: Package,
      color: "text-green-600",
    },
    {
      label: "Vendas",
      value: "0",
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      label: "Clientes",
      value: "0",
      icon: Users,
      color: "text-orange-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
          <div className="space-y-2">
            <a
              href="/dashboard/produtos/cadastro"
              className="block p-3 rounded-lg hover:bg-accent transition-colors"
            >
              Adicionar novo produto
            </a>
            <a
              href="/dashboard/loja"
              className="block p-3 rounded-lg hover:bg-accent transition-colors"
            >
              Editar informações da loja
            </a>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Informações</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Bem-vindo ao seu dashboard!</p>
            {!userStore && (
              <p className="text-destructive">
                Configure sua loja para começar a vender.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

