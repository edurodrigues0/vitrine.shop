"use client";

import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products-service";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
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

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", "store", userStore?.id],
    queryFn: () => productsService.findByStoreId(userStore!.id),
    enabled: !!userStore?.id,
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Button asChild>
          <Link href="/dashboard/produtos/cadastro">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Link>
        </Button>
      </div>

      {!products || products.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Você ainda não possui produtos cadastrados.
          </p>
          <Button asChild>
            <Link href="/dashboard/produtos/cadastro">
              Adicionar Primeiro Produto
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="p-6">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {product.description}
                </p>
              )}
              <div className="flex gap-2">
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
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

