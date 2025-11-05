"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products-service";
import { categoriesService } from "@/services/categories-service";
import { productVariationsService } from "@/services/product-variations-service";
import { productImagesService } from "@/services/product-images-service";
import { useSelectedStore } from "@/hooks/use-selected-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Edit, Trash2, Package, Search, Filter, PlusCircle, MinusCircle, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export default function ProductsPage() {
  const { selectedStore } = useSelectedStore();
  const queryClient = useQueryClient();
  const [nameFilter, setNameFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Fetch categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesService.findAll(),
  });

  const categories = categoriesData?.categories || [];

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products", "store", selectedStore?.id],
    queryFn: () => {
      if (!selectedStore?.id) {
        throw new Error("Loja não encontrada");
      }
      return productsService.findByStoreId(selectedStore.id);
    },
    enabled: !!selectedStore?.id,
    retry: 2,
    retryDelay: 1000,
  });

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter((product) => {
      const matchesName = nameFilter === "" || 
        product.name.toLowerCase().includes(nameFilter.toLowerCase());
      const matchesCategory = categoryFilter === "" || 
        product.categoryId === categoryFilter;
      
      return matchesName && matchesCategory;
    });
  }, [products, nameFilter, categoryFilter]);

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

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      return await productsService.update(id, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Estoque atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar estoque");
    },
  });

  const handleIncreaseStock = (productId: string, currentQuantity: number) => {
    updateQuantityMutation.mutate({ 
      id: productId, 
      quantity: currentQuantity + 1 
    });
  };

  const handleDecreaseStock = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 0) {
      updateQuantityMutation.mutate({ 
        id: productId, 
        quantity: currentQuantity - 1 
      });
    }
  };

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

  if (!selectedStore) {
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
          {/* Filters */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Filtros</h3>
            </div>
            <FieldGroup>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="nameFilter">Buscar por Nome</FieldLabel>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nameFilter"
                      placeholder="Digite o nome do produto..."
                      value={nameFilter}
                      onChange={(e) => setNameFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </Field>
                <Field>
                  <FieldLabel htmlFor="categoryFilter">Filtrar por Categoria</FieldLabel>
                  <select
                    id="categoryFilter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              {(nameFilter || categoryFilter) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNameFilter("");
                    setCategoryFilter("");
                  }}
                  className="mt-2"
                >
                  Limpar Filtros
                </Button>
              )}
            </FieldGroup>
          </Card>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de Produtos</p>
                  <p className="text-2xl font-bold">{filteredProducts.length}</p>
                </div>
                <Package className="h-8 w-8 text-primary opacity-50" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Com Estoque</p>
                  <p className="text-2xl font-bold">
                    {filteredProducts.filter(p => (p.quantity ?? 0) > 0).length}
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
                    {filteredProducts.filter(p => (p.quantity ?? 0) === 0).length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-orange-600 dark:text-orange-400 opacity-50" />
              </div>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full">
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    Nenhum produto encontrado com os filtros aplicados.
                  </p>
                </Card>
              </div>
            ) : (
              filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Componente para exibir card de produto com imagem
function ProductCard({ product }: { product: any }) {
  // Buscar variações do produto
  const { data: variationsData } = useQuery({
    queryKey: ["product-variations", product.id],
    queryFn: () => productVariationsService.findByProductId(product.id),
    enabled: !!product.id,
  });

  const variations = variationsData?.productVariations || [];
  const firstVariation = variations[0];

  // Buscar imagens da primeira variação
  const { data: imagesData } = useQuery({
    queryKey: ["product-images", firstVariation?.id],
    queryFn: () =>
      firstVariation
        ? productImagesService.findByProductVariationId(firstVariation.id)
        : Promise.resolve({ productImages: [] }),
    enabled: !!firstVariation?.id,
  });

  const images = imagesData?.productImages || [];
  const mainImage = images.find((img: any) => img.isMain) || images[0];

  const queryClient = useQueryClient();

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

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      return await productsService.update(id, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Estoque atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar estoque");
    },
  });

  const handleIncreaseStock = (productId: string, currentQuantity: number) => {
    updateQuantityMutation.mutate({ 
      id: productId, 
      quantity: currentQuantity + 1 
    });
  };

  const handleDecreaseStock = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 0) {
      updateQuantityMutation.mutate({ 
        id: productId, 
        quantity: currentQuantity - 1 
      });
    }
  };

  return (
    <Card key={product.id} className="p-6 hover:shadow-lg transition-all group overflow-hidden">
      <div className="space-y-4">
        {/* Product Image */}
        {mainImage ? (
          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
            <Image
              src={mainImage.url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          </div>
        ) : (
          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground opacity-50" />
          </div>
        )}

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

        {/* Stock Controls */}
        <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
          <span className="text-xs text-muted-foreground">Ajustar Estoque:</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleDecreaseStock(product.id, product.quantity ?? 0)}
              disabled={updateQuantityMutation.isPending || (product.quantity ?? 0) === 0}
            >
              <MinusCircle className="h-3 w-3" />
            </Button>
            <span className="font-semibold min-w-[3rem] text-center">
              {product.quantity ?? 0}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleIncreaseStock(product.id, product.quantity ?? 0)}
              disabled={updateQuantityMutation.isPending}
            >
              <PlusCircle className="h-3 w-3" />
            </Button>
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
  );
}

