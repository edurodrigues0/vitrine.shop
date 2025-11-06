"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { storesService } from "@/services/stores-service";
import { productsService } from "@/services/products-service";
import { productVariationsService } from "@/services/product-variations-service";
import { productImagesService } from "@/services/product-images-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Loader2,
  Instagram,
  Facebook,
  MessageCircle,
  MapPin,
  ShoppingCart,
  Star,
  Package,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { LazyImage } from "@/components/lazy-image";
import type { Product } from "@/dtos/product";
import { citiesService } from "@/services/cities-service";
import { SkeletonStoreCard } from "@/components/skeleton-loader";
import { Pagination } from "@/components/pagination";
import { useState, useEffect, useMemo, memo } from "react";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { categoriesService } from "@/services/categories-service";

export default function StorePage() {
  const params = useParams();
  const citySlug = params.city as string;
  const storeSlug = params.slug as string;

  const { data: store, isLoading: isLoadingStore, error: storeError } = useQuery({
    queryKey: ["store", "slug", storeSlug],
    queryFn: async () => {
      try {
        const result = await storesService.findBySlug(storeSlug);
        return result;
      } catch (error) {
        console.error("Error fetching store:", error);
        throw error;
      }
    },
  });

  // Buscar cidade para exibir informações
  const { data: citiesData } = useQuery({
    queryKey: ["cities"],
    queryFn: () => citiesService.findAll(),
    staleTime: 1000 * 60 * 60,
  });

  const city = citiesData?.cities.find((c) => c.id === store?.cityId);

  const { data: productsData, isLoading: isLoadingProducts, error: productsError } = useQuery({
    queryKey: ["products", "store", store?.id],
    queryFn: async () => {
      if (!store?.id) return [];
      try {
        const result = await productsService.findByStoreId(store.id);
        return result;
      } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
    },
    enabled: !!store?.id,
  });

  const products = Array.isArray(productsData) ? productsData : [];

  // Buscar categorias para filtro
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesService.findAll(),
  });

  const categories = categoriesData?.categories || [];

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  // Filtrar produtos
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filtro por nome
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoria
    if (selectedCategoryId) {
      filtered = filtered.filter(
        (product) => product.categoryId === selectedCategoryId
      );
    }

    return filtered;
  }, [products, searchTerm, selectedCategoryId]);
  
  // Paginação de produtos
  const [productsPage, setProductsPage] = useState(1);
  const itemsPerPage = 12;
  const productsTotalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (productsPage - 1) * itemsPerPage,
    productsPage * itemsPerPage
  );

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setProductsPage(1);
  }, [searchTerm, selectedCategoryId]);

  // Registrar visita quando a página carregar
  useEffect(() => {
    if (store?.id) {
      storesService.trackVisit(store.id).catch((error) => {
        console.error("Erro ao registrar visita:", error);
      });
    }
  }, [store?.id]);

  if (isLoadingStore) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Card className="p-8">
              <div className="flex items-center gap-6">
                <div className="h-32 w-32 bg-muted rounded-2xl animate-pulse" />
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                  <div className="h-4 bg-muted rounded animate-pulse w-full" />
                </div>
              </div>
            </Card>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonStoreCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (storeError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-destructive/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Erro ao carregar loja</h1>
          <p className="text-destructive mb-6">
            {storeError instanceof Error ? storeError.message : "Erro desconhecido"}
          </p>
          <Link href={`/cidade/${citySlug}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a cidade
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!store && !isLoadingStore) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Store className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Loja não encontrada</h1>
          <p className="text-muted-foreground mb-6">
            A loja que você está procurando não existe.
          </p>
          <Link href={`/cidade/${citySlug}`}>
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a cidade
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!store) {
    return null;
  }

  const whatsappUrl = store.whatsapp
    ? `https://wa.me/${store.whatsapp.replace(/\D/g, "")}`
    : "#";

  const themeColors = store.theme || {
    primaryColor: "#4f46e5",
    secondaryColor: "#7c3aed",
    tertiaryColor: "#ec4899",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Banner Section */}
      <div className="relative w-full">
        {store.bannerUrl ? (
          <div className="relative h-64 md:h-80 lg:h-96 w-full overflow-hidden">
            <Image
              src={store.bannerUrl}
              alt={store.name}
              fill
              className="object-cover"
              priority
              unoptimized
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent" />
          </div>
        ) : (
          <div
            className="h-64 md:h-80 lg:h-96 w-full flex items-center justify-center relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${themeColors.primaryColor}15 0%, ${themeColors.secondaryColor}15 50%, ${themeColors.tertiaryColor}15 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <Store className="h-32 w-32 text-primary/30" />
          </div>
        )}

        {/* Store Info Overlay */}
        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <Card className="p-6 md:p-8 shadow-xl border-2 bg-card/95 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              {store.logoUrl ? (
                <div className="relative h-24 w-24 md:h-32 md:w-32 flex-shrink-0 rounded-2xl overflow-hidden border-4 border-background shadow-lg">
                  <Image
                    src={store.logoUrl}
                    alt={store.name}
                    fill
                    className="object-cover"
                    unoptimized
                    priority
                    sizes="128px"
                  />
                </div>
              ) : (
                <div
                  className="h-24 w-24 md:h-32 md:w-32 flex-shrink-0 rounded-2xl flex items-center justify-center border-4 border-background shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.primaryColor} 0%, ${themeColors.secondaryColor} 100%)`,
                  }}
                >
                  <Store className="h-12 w-12 md:h-16 md:w-16 text-white" />
                </div>
              )}

              {/* Store Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl md:text-4xl font-bold">{store.name}</h1>
                      {store.status === "ACTIVE" && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Ativa
                        </Badge>
                      )}
                    </div>
                    {city && (
                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{city.name} - {city.state}</span>
                      </div>
                    )}
                  </div>
                </div>

                {store.description && (
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {store.description}
                  </p>
                )}

                {/* Social Links & Contact */}
                <div className="flex flex-wrap items-center gap-4">
                  {store.instagramUrl && (
                    <a
                      href={store.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="text-sm font-medium">Instagram</span>
                    </a>
                  )}
                  {store.facebookUrl && (
                    <a
                      href={store.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="text-sm font-medium">Facebook</span>
                    </a>
                  )}
                  {store.whatsapp && (
                    <Button
                      asChild
                      size="lg"
                      className="bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg"
                    >
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="h-5 w-5" />
                        Entrar em contato
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Produtos</h2>
            <p className="text-muted-foreground">
              {filteredProducts.length > 0
                ? `${filteredProducts.length} ${filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}`
                : products.length > 0
                ? "Nenhum produto encontrado com os filtros aplicados"
                : "Navegue pelos nossos produtos"}
            </p>
          </div>
        </div>

        {/* Filtros */}
        {products.length > 0 && (
          <Card className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Busca por nome */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro por categoria */}
              <div className="md:w-64">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botão limpar filtros */}
              {(searchTerm || selectedCategoryId) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategoryId("");
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </Card>
        )}

        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonStoreCard key={i} />
            ))}
          </div>
        ) : productsError ? (
          <Card className="p-12 text-center">
            <div className="bg-destructive/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-destructive" />
            </div>
            <p className="text-destructive text-lg font-medium">
              Erro ao carregar produtos. Tente novamente mais tarde.
            </p>
          </Card>
        ) : products.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum produto cadastrado</h3>
            <p className="text-muted-foreground">
              Esta loja ainda não possui produtos cadastrados.
            </p>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Não há produtos que correspondam aos filtros aplicados.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategoryId("");
              }}
            >
              Limpar filtros
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  citySlug={citySlug}
                />
              ))}
            </div>
            {productsTotalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={productsPage}
                  totalPages={productsTotalPages}
                  onPageChange={setProductsPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Componente para exibir card de produto com variações e imagens
const ProductCard = memo(function ProductCard({
  product,
  citySlug,
}: {
  product: Product;
  citySlug: string;
}) {
  const { data: variationsData } = useQuery({
    queryKey: ["product-variations", product.id],
    queryFn: () => productVariationsService.findByProductId(product.id),
    enabled: !!product.id,
  });

  const variations = variationsData?.productVariations || [];
  const firstVariation = variations[0];

  const { data: imagesData } = useQuery({
    queryKey: ["product-images", firstVariation?.id],
    queryFn: () =>
      productImagesService.findByProductVariationId(firstVariation!.id),
    enabled: !!firstVariation?.id,
  });

  const images = imagesData?.productImages || [];
  const mainImage = images.find((img: any) => img.isMain) || images[0];

  // Calcular preço mínimo e máximo
  const prices = variations.map(
    (v: any) => v.discountPrice || v.price
  );
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
  const hasVariation = variations.length > 0;
  const isOutOfStock = hasVariation && variations.every((v: any) => v.stock === 0);
  const hasDiscount = variations.some((v: any) => v.discountPrice);

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-2 hover:border-primary/50 bg-card">
      <Link href={`/cidade/${citySlug}/produto/${product.id}`}>
        {/* Imagem do produto */}
        <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
          {mainImage ? (
            <LazyImage
              src={mainImage.url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          {hasDiscount && (
            <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">
              Oferta
            </Badge>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                Fora de estoque
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            )}
          </div>

          {/* Preço */}
          <div className="flex items-baseline gap-2">
            {hasVariation && minPrice ? (
              minPrice === maxPrice ? (
                <>
                  <span className="text-2xl font-bold text-primary">
                    R$ {(minPrice / 100).toFixed(2).replace(".", ",")}
                  </span>
                  {variations[0]?.discountPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      R$ {(variations[0].price / 100).toFixed(2).replace(".", ",")}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-lg font-bold text-primary">
                  A partir de R$ {(minPrice / 100).toFixed(2).replace(".", ",")}
                </span>
              )
            ) : product.price ? (
              <span className="text-2xl font-bold text-primary">
                R$ {(product.price / 100).toFixed(2).replace(".", ",")}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                Preço não disponível
              </span>
            )}
          </div>

          {/* Botão */}
          <Button
            variant={isOutOfStock ? "outline" : "default"}
            className="w-full"
            disabled={isOutOfStock}
          >
            {isOutOfStock ? (
              <>
                <Package className="h-4 w-4 mr-2" />
                Indisponível
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ver detalhes
              </>
            )}
          </Button>
        </div>
      </Link>
    </Card>
  );
});
