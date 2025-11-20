"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products-service";
import { productVariationsService } from "@/services/product-variations-service";
import { productImagesService } from "@/services/product-images-service";
import { storesService } from "@/services/stores-service";
import { categoriesService } from "@/services/categories-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ShoppingCart,
  ArrowLeft,
  Package,
  CheckCircle2,
  XCircle,
  Star,
  Share2,
  Heart,
  Minus,
  Plus,
  Store,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/contexts/cart-context";
import { showError, showSuccess } from "@/lib/toast";
import Link from "next/link";
import type { ProductVariation } from "@/dtos/product-variation";
import type { ProductImage } from "@/dtos/product-image";
import { SkeletonText } from "@/components/skeleton-loader";
import { ProductGallery } from "@/components/product-gallery";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const citySlug = params.city as string;
  const productId = params.id as string;
  const { addItem } = useCart();

  const [selectedVariation, setSelectedVariation] =
    useState<ProductVariation | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productsService.findById(productId),
  });

  const { data: variationsData, isLoading: isLoadingVariations } = useQuery({
    queryKey: ["product-variations", productId],
    queryFn: () => productVariationsService.findByProductId(productId),
    enabled: !!productId,
  });

  const variations = variationsData?.productVariations || [];

  // Buscar loja do produto
  const { data: store } = useQuery({
    queryKey: ["store", product?.storeId],
    queryFn: () => storesService.findById(product!.storeId),
    enabled: !!product?.storeId,
    retry: false, // Não tentar novamente se a loja não for encontrada (404)
  });

  // Buscar categoria
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesService.findAll(),
  });

  const category = categoriesData?.categories.find(
    (c) => c.id === product?.categoryId
  );

  // Get images for selected variation
  const { data: imagesData, isLoading: isLoadingImages } = useQuery({
    queryKey: ["product-images", selectedVariation?.id],
    queryFn: () =>
      productImagesService.findByProductVariationId(selectedVariation!.id),
    enabled: !!selectedVariation?.id,
  });

  const images = imagesData?.productImages || [];
  const displayedImages = images.length > 0 ? images : [];

  // Auto-select first variation
  useEffect(() => {
    if (variations.length > 0 && !selectedVariation) {
      setSelectedVariation(variations[0]);
    }
  }, [variations, selectedVariation]);

  // Reset quantity when variation changes or when product changes
  // Usar valores estáveis para garantir que o array de dependências tenha tamanho constante
  const variationId = selectedVariation?.id ?? null;
  const currentProductId = product?.id ?? null;
  
  useEffect(() => {
    if (currentProductId) {
      setQuantity(1);
    }
  }, [variationId, currentProductId]);

  if (isLoadingProduct || isLoadingVariations) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <Card className="aspect-square bg-muted animate-pulse" />
            <div className="space-y-6">
              <SkeletonText lines={2} />
              <div className="h-12 bg-muted rounded animate-pulse w-1/3" />
              <SkeletonText lines={3} />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="h-20 bg-muted rounded animate-pulse" />
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-destructive/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            O produto que você está procurando não existe.
          </p>
          <Button variant="outline" onClick={() => router.back()} className="flex items-center justify-center gap-2 whitespace-nowrap">
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span>Voltar</span>
          </Button>
        </div>
      </div>
    );
  }

  // Determinar preço - usar variação se disponível, senão usar produto base
  const price = selectedVariation
    ? selectedVariation.discountPrice || selectedVariation.price
    : product.price
      ? product.price
      : null;
  
  const originalPrice = selectedVariation
    ? selectedVariation.discountPrice
      ? selectedVariation.price
      : null
    : null;
  
  const discountPercentage = originalPrice && price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Determinar estoque - usar variação se disponível, senão usar produto base
  const availableStock = selectedVariation
    ? selectedVariation.stock
    : product.quantity ?? 0;
  
  const maxQuantity = Math.min(availableStock, 10);
  const isAvailable = availableStock > 0;

  const handleAddToCart = () => {
    if (!product) return;

    if (!isAvailable) {
      showError("Produto fora de estoque");
      return;
    }

    if (quantity > availableStock) {
      showError(`Quantidade disponível: ${availableStock} unidades`);
      return;
    }

    // Se não há variações, criar uma variação padrão para o carrinho
    if (!selectedVariation && variations.length === 0) {
      // Criar variação temporária para adicionar ao carrinho
      const defaultVariation: ProductVariation = {
        id: `default-${product.id}`,
        productId: product.id,
        price: product.price || 0,
        stock: product.quantity || 0,
        color: "Padrão",
        size: "Único",
        discountPrice: null,
      };
      
      try {
        addItem(product, defaultVariation, quantity);
        showSuccess(
          `${quantity} ${quantity === 1 ? "produto" : "produtos"} adicionado${quantity === 1 ? "" : "s"} ao carrinho!`,
        );
        setQuantity(1);
      } catch (error) {
        showError(
          error instanceof Error
            ? error.message
            : "Erro ao adicionar ao carrinho",
        );
      }
      return;
    }

    if (!selectedVariation) {
      showError("Selecione uma variação do produto");
      return;
    }

    try {
      addItem(product, selectedVariation, quantity);
      showSuccess(
        `${quantity} ${quantity === 1 ? "produto" : "produtos"} adicionado${quantity === 1 ? "" : "s"} ao carrinho!`,
      );
      setQuantity(1);
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Erro ao adicionar ao carrinho",
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="h-auto p-0"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <span>/</span>
          {store && (
            <>
              <Link
                href={`/cidade/${citySlug}/loja/${store.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {store.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {isLoadingImages ? (
              <Card className="aspect-square relative overflow-hidden rounded-xl border-2 bg-muted flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </Card>
            ) : (
              <ProductGallery images={displayedImages} productName={product.name} />
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-4xl font-bold leading-tight">{product.name}</h1>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="shrink-0">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={async () => {
                      try {
                        const productUrl = window.location.href;
                        await navigator.clipboard.writeText(productUrl);
                        showSuccess("Link copiado para área de transferência!");
                      } catch (error) {
                        console.error("Erro ao copiar link:", error);
                        showError("Erro ao copiar link");
                      }
                    }}
                    title="Compartilhar produto"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Category & Store */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {category && (
                  <Badge variant="secondary">
                    {category.name}
                  </Badge>
                )}
                {store && (
                  <Link
                    href={`/cidade/${citySlug}/loja/${store.slug}`}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Store className="h-4 w-4" />
                    {store.name}
                  </Link>
                )}
              </div>

              {product.description && (
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {product.description}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2 pb-4 border-b">
              {price ? (
                <>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-4xl font-bold text-primary">
                      R$ {(price / 100).toFixed(2).replace(".", ",")}
                    </span>
                    {originalPrice && (
                      <>
                        <span className="text-xl text-muted-foreground line-through">
                          R$ {(originalPrice / 100).toFixed(2).replace(".", ",")}
                        </span>
                        <Badge variant="destructive" className="text-sm px-2 py-1">
                          -{discountPercentage}%
                        </Badge>
                      </>
                    )}
                  </div>
                  {originalPrice && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Economize R$ {((originalPrice - price) / 100).toFixed(2).replace(".", ",")}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-5 w-5" />
                  <span className="text-lg">Preço não disponível</span>
                </div>
              )}
            </div>

            {/* Variations */}
            {variations.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Selecione a variação:</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {variations.map((variation) => {
                      const isSelected = selectedVariation?.id === variation.id;
                      const variationPrice = variation.discountPrice || variation.price;
                      const hasDiscount = !!variation.discountPrice;

                      return (
                        <Card
                          key={variation.id}
                          className={`p-4 cursor-pointer transition-all duration-200 border-2 relative ${
                            isSelected
                              ? "border-primary bg-primary/10 dark:bg-primary/20 ring-2 ring-primary/30 shadow-md shadow-primary/10"
                              : "border-border hover:border-primary/50 hover:bg-accent/50 dark:hover:bg-accent/30"
                          }`}
                          onClick={() => {
                            setSelectedVariation(variation);
                          }}
                        >
                          {/* Indicador de seleção */}
                          {isSelected && (
                            <div className="absolute top-3 right-3">
                              <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center pr-8">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <p className={`font-semibold text-lg transition-colors ${
                                  isSelected ? "text-primary" : "text-foreground"
                                }`}>
                                  {variation.color} - {variation.size}
                                </p>
                                {hasDiscount && (
                                  <Badge variant="destructive" className="text-xs">
                                    Oferta
                                  </Badge>
                                )}
                                {isSelected && (
                                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                                    Selecionado
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <p className="text-sm text-muted-foreground">
                                  Estoque:{" "}
                                  <span
                                    className={`font-medium ${
                                      variation.stock > 0
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-destructive"
                                    }`}
                                  >
                                    {variation.stock > 0
                                      ? `${variation.stock} unidades`
                                      : "Fora de estoque"}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="flex items-baseline gap-2">
                                <span className={`text-xl font-bold transition-colors ${
                                  isSelected ? "text-primary" : "text-foreground"
                                }`}>
                                  R${" "}
                                  {(variationPrice / 100)
                                    .toFixed(2)
                                    .replace(".", ",")}
                                </span>
                                {hasDiscount && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    R${" "}
                                    {(variation.price / 100)
                                      .toFixed(2)
                                      .replace(".", ",")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Este produto não possui variações disponíveis.
                </p>
              </div>
            )}

            {/* Quantity & Stock Info */}
            <div className="space-y-4 pt-4 border-t">
              <div>
                <p className="text-sm font-semibold mb-3">Quantidade:</p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || !isAvailable}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center justify-center w-16 h-10 border-2 border-border rounded-md bg-background">
                    <span className="text-lg font-semibold">
                      {quantity}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setQuantity(Math.min(maxQuantity, quantity + 1))
                    }
                    disabled={quantity >= maxQuantity || !isAvailable}
                    className="h-10 w-10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {isAvailable && (
                    <span className="text-sm text-muted-foreground ml-2">
                      (máx. {maxQuantity})
                    </span>
                  )}
                </div>
              </div>

              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                isAvailable 
                  ? "bg-green-500/10 border border-green-500/20" 
                  : "bg-red-500/10 border border-red-500/20"
              }`}>
                {isAvailable ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm">
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {availableStock}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {availableStock === 1
                          ? "unidade disponível em estoque"
                          : "unidades disponíveis em estoque"}
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      Produto indisponível no momento
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-3 pt-4 border-t">
              <Button
                size="lg"
                className="w-full text-lg h-14 font-semibold"
                disabled={!isAvailable || (variations.length > 0 && !selectedVariation)}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isAvailable 
                  ? variations.length > 0 && !selectedVariation
                    ? "Selecione uma variação"
                    : `Adicionar ${quantity} ${quantity === 1 ? "produto" : "produtos"} ao carrinho`
                  : "Produto indisponível"}
              </Button>

              {isAvailable && price && (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    R$ {((price * quantity) / 100).toFixed(2).replace(".", ",")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <RelatedProducts 
          currentProductId={product.id}
          categoryId={product.categoryId}
          storeId={product.storeId}
          citySlug={citySlug}
        />
      </div>
    </div>
  );
}

// Componente de Produtos Relacionados
function RelatedProducts({
  currentProductId,
  categoryId,
  storeId,
  citySlug,
}: {
  currentProductId: string;
  categoryId: string;
  storeId: string;
  citySlug: string;
}) {
  // Buscar produtos da mesma categoria e loja
  const { data: relatedProductsData, isLoading } = useQuery({
    queryKey: ["products", "related", storeId, categoryId],
    queryFn: async () => {
      const response = await productsService.findByStoreId(storeId);
      // Filtrar produtos da mesma categoria, excluindo o produto atual
      return response.filter(
        (p) => p.categoryId === categoryId && p.id !== currentProductId
      );
    },
    enabled: !!storeId && !!categoryId,
  });

  const relatedProducts = useMemo(() => {
    return (relatedProductsData || []).slice(0, 4); // Limitar a 4 produtos
  }, [relatedProductsData]);

  // Buscar imagens e variações para cada produto relacionado
  const { data: variationsData } = useQuery({
    queryKey: ["product-variations", "related", relatedProducts.map(p => p.id)],
    queryFn: async () => {
      const variationsMap: Record<string, any[]> = {};
      for (const product of relatedProducts) {
        try {
          const variations = await productVariationsService.findByProductId(product.id);
          variationsMap[product.id] = variations.productVariations || [];
        } catch (error) {
          console.error(`Error fetching variations for product ${product.id}:`, error);
          variationsMap[product.id] = [];
        }
      }
      return variationsMap;
    },
    enabled: relatedProducts.length > 0,
  });

  const { data: imagesData } = useQuery({
    queryKey: ["product-images", "related", relatedProducts.map(p => p.id), variationsData],
    queryFn: async () => {
      const imagesMap: Record<string, any[]> = {};
      for (const product of relatedProducts) {
        const variations = variationsData?.[product.id] || [];
        if (variations.length > 0) {
          try {
            const images = await productImagesService.findByProductVariationId(variations[0].id);
            imagesMap[product.id] = images.productImages || [];
          } catch (error: any) {
            // 404 significa que não há imagens, o que é válido - não é um erro crítico
            if (error?.status === 404) {
              imagesMap[product.id] = [];
            } else {
              // Outros erros são logados mas não quebram a UI
              console.warn(`No images found for product ${product.id} (variation ${variations[0].id}):`, error);
              imagesMap[product.id] = [];
            }
          }
        } else {
          // Sem variações, sem imagens
          imagesMap[product.id] = [];
        }
      }
      return imagesMap;
    },
    enabled: relatedProducts.length > 0 && !!variationsData,
    retry: false, // Não tentar novamente em caso de 404
  });

  if (isLoading) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Produtos Relacionados</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="aspect-square bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Produtos Relacionados</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedProducts.map((product) => {
          const variations = variationsData?.[product.id] || [];
          const images = imagesData?.[product.id] || [];
          const mainImage = images.find((img: any) => img.isMain) || images[0];
          const firstVariation = variations[0];
          const price = firstVariation
            ? firstVariation.discountPrice || firstVariation.price
            : product.price;

          return (
            <Link
              key={product.id}
              href={`/cidade/${citySlug}/produto/${product.id}`}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all group">
                <div className="relative aspect-square bg-muted overflow-hidden">
                  {mainImage ? (
                    <Image
                      src={mainImage.url}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  {price && (
                    <p className="text-lg font-bold text-primary">
                      R$ {(price / 100).toFixed(2).replace(".", ",")}
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
