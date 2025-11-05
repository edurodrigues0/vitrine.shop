"use client";

import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products-service";
import { storesService } from "@/services/stores-service";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit, Trash2, Package } from "lucide-react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ProductsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's store
  const { data: storesData } = useQuery({
    queryKey: ["stores", "user", user?.id],
    queryFn: () => storesService.findAll(),
    enabled: !!user,
  });

  const userStore = storesData?.stores.find(
    (store) => store.ownerId === user?.id,
  );

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products", "store", userStore?.id],
    queryFn: () => {
      if (!userStore?.id) {
        throw new Error("Loja não encontrada");
      }
      return productsService.findByStoreId(userStore.id);
    },
    enabled: !!userStore?.id,
    retry: 2, // Tentar novamente 2 vezes em caso de erro de rede
    retryDelay: 1000, // Esperar 1 segundo entre tentativas
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir produto");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Produtos</h1>
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">
            {error instanceof Error 
              ? error.message 
              : "Erro ao carregar produtos. Verifique se o servidor está rodando."}
          </p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["products"] })}>
            Tentar novamente
          </Button>
        </Card>
      </div>
    );
  }

  if (!userStore) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Produtos</h1>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Você precisa criar uma loja antes de adicionar produtos.
          </p>
          <Button asChild>
            <Link href="/dashboard/loja/cadastro">Criar Loja</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os produtos da sua loja
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/dashboard/produtos/cadastro">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Link>
        </Button>
      </div>

      {!products || products.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Nenhum produto cadastrado</h2>
          <p className="text-muted-foreground mb-6">
            Comece adicionando seu primeiro produto à loja.
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard/produtos/cadastro">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Produto
            </Link>
          </Button>
        </Card>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de Produtos</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <Package className="h-8 w-8 text-primary opacity-50" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Com Estoque</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => (p.quantity ?? 0) > 0).length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-green-600 dark:text-green-400 opacity-50" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sem Estoque</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => (p.quantity ?? 0) === 0).length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-orange-600 dark:text-orange-400 opacity-50" />
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="p-6 hover:shadow-lg transition-all group">
                <div className="space-y-4">
                  {/* Product Header */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    {product.price !== null && product.price !== undefined && (
                      <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <span className="text-xs text-muted-foreground">Preço</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          R$ {(product.price / 100).toFixed(2).replace(".", ",")}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <span className="text-xs text-muted-foreground">Estoque</span>
                      <span className={`font-semibold ${
                        (product.quantity ?? 0) > 0 
                          ? "text-green-600 dark:text-green-400" 
                          : "text-orange-600 dark:text-orange-400"
                      }`}>
                        {product.quantity ?? 0} unidades
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/dashboard/produtos/${product.id}/editar`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (
                          confirm(
                            "Tem certeza que deseja excluir este produto?",
                          )
                        ) {
                          deleteMutation.mutate(product.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

