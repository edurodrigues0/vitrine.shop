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
import type { Product } from "@/dtos/product";
import { citiesService } from "@/services/cities-service";

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

  if (isLoadingStore) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Produtos</h2>
            <p className="text-muted-foreground">
              {products.length > 0
                ? `${products.length} ${products.length === 1 ? "produto disponível" : "produtos disponíveis"}`
                : "Navegue pelos nossos produtos"}
            </p>
          </div>
        </div>

        {isLoadingProducts ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                citySlug={citySlug}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para exibir card de produto com variações e imagens
function ProductCard({
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
        <div className="relative aspect-square w-full bg-muted overflow-hidden">
          {mainImage ? (
            <Image
              src={mainImage.url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/50" />
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
          {hasVariation && minPrice && (
            <div className="flex items-baseline gap-2">
              {minPrice === maxPrice ? (
                <>
                  <span className="text-2xl font-bold">
                    R$ {(minPrice / 100).toFixed(2).replace(".", ",")}
                  </span>
                  {variations[0]?.discountPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      R$ {(variations[0].price / 100).toFixed(2).replace(".", ",")}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-lg font-bold">
                  A partir de R$ {(minPrice / 100).toFixed(2).replace(".", ",")}
                </span>
              )}
            </div>
          )}

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
}
