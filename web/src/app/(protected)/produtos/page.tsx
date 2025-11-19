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
import { Loader2, Plus, Edit, Trash2, Package, Search, Filter, PlusCircle, MinusCircle, Image as ImageIcon, Grid3x3, List, ArrowUpDown, ArrowUp, ArrowDown, X } from "lucide-react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showError, showSuccess } from "@/lib/toast";
import Image from "next/image";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Tooltip } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

type ViewMode = "grid" | "list";
type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "stock-asc" | "stock-desc" | "date-asc" | "date-desc";

export default function ProductsPage() {
  const { selectedStore, isLoading: isLoadingStore } = useSelectedStore();
  const queryClient = useQueryClient();
  const [nameFilter, setNameFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortOption, setSortOption] = useState<SortOption>("name-asc");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

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

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];
    
    // Filter
    let filtered = products.filter((product) => {
      const matchesName = nameFilter === "" || 
        product.name.toLowerCase().includes(nameFilter.toLowerCase());
      const matchesCategory = categoryFilter === "" || 
        product.categoryId === categoryFilter;
      
      return matchesName && matchesCategory;
    });

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return (a.price ?? 0) - (b.price ?? 0);
        case "price-desc":
          return (b.price ?? 0) - (a.price ?? 0);
        case "stock-asc":
          return (a.quantity ?? 0) - (b.quantity ?? 0);
        case "stock-desc":
          return (b.quantity ?? 0) - (a.quantity ?? 0);
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, nameFilter, categoryFilter, sortOption]);

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const selectAllProducts = () => {
    if (selectedProducts.size === filteredAndSortedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredAndSortedProducts.map((p) => p.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedProducts.size === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const handleConfirmBulkDelete = () => {
    selectedProducts.forEach((id) => {
      deleteMutation.mutate(id);
    });
    setSelectedProducts(new Set());
    setBulkDeleteDialogOpen(false);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showSuccess("Produto excluído com sucesso!");
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: () => {
      showError("Erro ao excluir produto");
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      return await productsService.update(id, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showSuccess("Estoque atualizado com sucesso!");
    },
    onError: () => {
      showError("Erro ao atualizar estoque");
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
        <ErrorState
          title="Erro ao carregar produtos"
          description={error instanceof Error 
            ? error.message 
            : "Não foi possível carregar os produtos. Verifique sua conexão com a internet e tente novamente."}
          icon={Package}
          action={{
            label: "Tentar novamente",
            onClick: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
            variant: "default",
          }}
        />
      </div>
    );
  }

  // Mostrar loading enquanto está carregando as lojas
  if (isLoadingStore) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Produtos</h1>
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </Card>
      </div>
    );
  }

  // Só mostrar mensagem de "criar loja" se não estiver carregando e realmente não tiver loja
  if (!selectedStore && !isLoadingStore) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Produtos</h1>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Você precisa criar uma loja antes de adicionar produtos.
          </p>
          <Button asChild>
            <Link href="/loja/cadastro">Criar Loja</Link>
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
          <Link href="/produtos/cadastro" className="flex items-center justify-center gap-2 whitespace-nowrap">
            <Plus className="h-4 w-4 shrink-0" />
            <span>Adicionar Produto</span>
          </Link>
        </Button>
      </div>

      {!products || products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum produto cadastrado"
          description="Comece adicionando seu primeiro produto à loja. Você pode criar produtos com variações, imagens e muito mais."
          action={{
            label: "Adicionar Primeiro Produto",
            onClick: () => {
              window.location.href = "/produtos/cadastro";
            },
            variant: "default",
          }}
        />
      ) : (
        <>
          {/* Filters and Controls */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Filtros e Ordenação</h3>
              </div>
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    <option value="name-asc">Nome (A-Z)</option>
                    <option value="name-desc">Nome (Z-A)</option>
                    <option value="price-asc">Preço (Menor)</option>
                    <option value="price-desc">Preço (Maior)</option>
                    <option value="stock-asc">Estoque (Menor)</option>
                    <option value="stock-desc">Estoque (Maior)</option>
                    <option value="date-desc">Mais Recente</option>
                    <option value="date-asc">Mais Antigo</option>
                  </select>
                </div>
              </div>
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
                    style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
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
                  <X className="h-4 w-4 shrink-0" />
                  <span>Limpar Filtros</span>
                </Button>
              )}
            </FieldGroup>
          </Card>

          {/* Bulk Actions */}
          {selectedProducts.size > 0 && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedProducts.size} produto(s) selecionado(s)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllProducts}
                  >
                    {selectedProducts.size === filteredAndSortedProducts.length
                      ? "Desselecionar todos"
                      : "Selecionar todos"}
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 shrink-0" />
                        <span>Excluir Selecionados</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Excluir {selectedProducts.size} produto(s) selecionado(s)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </Card>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total de Produtos</p>
                  <p className="text-2xl font-bold">{filteredAndSortedProducts.length}</p>
                </div>
                <Package className="h-8 w-8 text-primary opacity-50" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Com Estoque</p>
                  <p className="text-2xl font-bold">
                    {filteredAndSortedProducts.filter(p => (p.quantity ?? 0) > 0).length}
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
                    {filteredAndSortedProducts.filter(p => (p.quantity ?? 0) === 0).length}
                  </p>
                </div>
                <Package className="h-8 w-8 text-orange-600 dark:text-orange-400 opacity-50" />
              </div>
            </Card>
          </div>

          {/* Products Display */}
          {filteredAndSortedProducts.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Nenhum produto encontrado"
              description="Tente ajustar os filtros ou buscar por outros termos para encontrar produtos."
              action={{
                label: "Limpar Filtros",
                onClick: () => {
                  setNameFilter("");
                  setCategoryFilter("");
                },
                variant: "outline",
              }}
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  isSelected={selectedProducts.has(product.id)}
                  onToggleSelect={() => toggleProductSelection(product.id)}
                  onDeleteClick={(id) => {
                    setProductToDelete(id);
                    setDeleteDialogOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  isSelected={selectedProducts.has(product.id)}
                  onToggleSelect={() => toggleProductSelection(product.id)}
                  onDeleteClick={(id) => {
                    setProductToDelete(id);
                    setDeleteDialogOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            deleteMutation.reset();
            setProductToDelete(null);
          }
        }}
        title="Excluir Produto"
        description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
        isConfirmLoading={deleteMutation.isPending}
        confirmLoadingText="Excluindo..."
        status={
          deleteMutation.isError
            ? "error"
            : deleteMutation.isSuccess
              ? "success"
              : "idle"
        }
        statusMessage={
          deleteMutation.isError
            ? "Não foi possível excluir o produto."
            : deleteMutation.isSuccess
              ? "Produto excluído com sucesso."
              : undefined
        }
        autoCloseOnConfirm={false}
        onConfirm={() => {
          if (productToDelete) {
            deleteMutation.mutate(productToDelete);
          }
        }}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={(open) => {
          setBulkDeleteDialogOpen(open);
          if (!open) {
            deleteMutation.reset();
          }
        }}
        title="Excluir Produtos Selecionados"
        description={`Tem certeza que deseja excluir ${selectedProducts.size} produto(s)? Esta ação não pode ser desfeita.`}
        confirmText="Excluir Todos"
        cancelText="Cancelar"
        variant="destructive"
        isConfirmLoading={deleteMutation.isPending}
        confirmLoadingText="Excluindo..."
        autoCloseOnConfirm={false}
        onConfirm={handleConfirmBulkDelete}
      />
    </div>
  );
}

// Componente para exibir card de produto com imagem
function ProductCard({
  product,
  viewMode = "grid",
  isSelected = false,
  onToggleSelect,
  onDeleteClick,
}: {
  product: any;
  viewMode?: ViewMode;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onDeleteClick?: (id: string) => void;
}) {
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
      showSuccess("Produto excluído com sucesso!");
    },
    onError: () => {
      showError("Erro ao excluir produto");
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      return await productsService.update(id, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showSuccess("Estoque atualizado com sucesso!");
    },
    onError: () => {
      showError("Erro ao atualizar estoque");
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

  if (viewMode === "list") {
    return (
      <Card
        className={`p-4 hover:shadow-lg transition-all group cursor-pointer hovelift ${
          isSelected 
            ? "ring-2 ring-primary dark:ring-primary/80 bg-primary/5 dark:bg-primary/10 border-primary/50 dark:border-primary/40" 
            : "hover:bg-accent/50 dark:hover:bg-accent/20"
        }`}
        data-selected={isSelected}
      >
        <div className="flex items-center gap-4">
          {/* Checkbox */}
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="h-4 w-4 rounded border-input cursor-pointer accent-primary dark:accent-primary"
              style={{ 
                backgroundColor: isSelected ? undefined : 'hsl(var(--background))',
                borderColor: isSelected ? undefined : 'hsl(var(--border))'
              }}
            />
          )}
          {/* Product Image */}
          {mainImage ? (
            <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
              <Image
                src={mainImage.url}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
              <ImageIcon className="h-6 w-6 text-muted-foreground opacity-50" />
            </div>
          )}
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {product.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm">
              {product.price !== null && product.price !== undefined && (
                <span className="font-semibold text-green-600 dark:text-green-400">
                  R$ {(product.price / 100).toFixed(2).replace(".", ",")}
                </span>
              )}
              <span
                className={`font-semibold ${
                  (product.quantity ?? 0) > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-orange-600 dark:text-orange-400"
                }`}
              >
                Estoque: {product.quantity ?? 0}
              </span>
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleDecreaseStock(product.id, product.quantity ?? 0)}
                disabled={updateQuantityMutation.isPending || (product.quantity ?? 0) === 0}
              >
                <MinusCircle className="h-3 w-3" />
              </Button>
              <span className="font-semibold min-w-[2rem] text-center">
                {product.quantity ?? 0}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleIncreaseStock(product.id, product.quantity ?? 0)}
                disabled={updateQuantityMutation.isPending}
              >
                <PlusCircle className="h-3 w-3" />
              </Button>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/produtos/${product.id}/editar`} className="flex items-center justify-center gap-2 whitespace-nowrap">
                <Edit className="h-4 w-4 shrink-0" />
                <span>Editar</span>
              </Link>
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteClick?.(product.id)}
                  disabled={deleteMutation.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Excluir produto</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      key={product.id}
      className={`p-6 hover:shadow-lg transition-all group overflow-hidden cursor-pointer hovelift ${
        isSelected 
          ? "ring-2 ring-primary dark:ring-primary/80 bg-primary/5 dark:bg-primary/10 border-primary/50 dark:border-primary/40" 
          : "hover:bg-accent/50 dark:hover:bg-accent/20"
      }`}
      data-selected={isSelected}
    >
      <div className="space-y-4">
        {/* Checkbox */}
        {onToggleSelect && (
          <div className="absolute top-4 right-4 z-10">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="h-5 w-5 rounded border-input cursor-pointer accent-primary dark:accent-primary"
              style={{ 
                backgroundColor: isSelected ? undefined : 'hsl(var(--background))',
                borderColor: isSelected ? undefined : 'hsl(var(--border))'
              }}
            />
          </div>
        )}
        {/* Product Image */}
        {mainImage ? (
          <div className="relative h-32 w-full rounded-lg overflow-hidden bg-muted">
            <Image
              src={mainImage.url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          </div>
        ) : (
          <div className="relative h-32 w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
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
            <Link href={`/produtos/${product.id}/editar`} className="flex items-center justify-center gap-2 whitespace-nowrap">
              <Edit className="h-4 w-4 shrink-0" />
              <span>Editar</span>
            </Link>
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteClick?.(product.id)}
                disabled={deleteMutation.isPending}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir produto</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
}

