"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products-service";
import { productVariationsService } from "@/services/product-variations-service";
import { productImagesService } from "@/services/product-images-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { toast } from "sonner";
import type { ProductVariation } from "@/dtos/product-variation";
import type { ProductImage } from "@/dtos/product-image";

export default function ProductPage() {
  const params = useParams();
  const citySlug = params.city as string;
  const productId = params.id as string;
  const { addItem, canAddItem } = useCart();

  const [selectedVariation, setSelectedVariation] =
    useState<ProductVariation | null>(null);

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

  // Get images for selected variation
  const { data: imagesData, isLoading: isLoadingImages } = useQuery({
    queryKey: ["product-images", selectedVariation?.id],
    queryFn: () =>
      productImagesService.findByProductVariationId(selectedVariation!.id),
    enabled: !!selectedVariation?.id,
  });

  const images = imagesData?.productImages || [];
  const mainImage = images.find((img) => img.isMain) || images[0];

  // Auto-select first variation
  if (variations.length > 0 && !selectedVariation) {
    setSelectedVariation(variations[0]);
  }

  if (isLoadingProduct || isLoadingVariations) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <p className="text-muted-foreground mb-4">
            O produto que você está procurando não existe.
          </p>
        </div>
      </div>
    );
  }

  const price = selectedVariation
    ? selectedVariation.discountPrice || selectedVariation.price
    : null;
  const originalPrice = selectedVariation
    ? selectedVariation.discountPrice
      ? selectedVariation.price
      : null
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          {isLoadingImages ? (
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : mainImage ? (
            <div className="aspect-square relative rounded-lg overflow-hidden border border-border">
              <Image
                src={mainImage.url}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-24 w-24 text-muted-foreground" />
            </div>
          )}

          {/* Additional Images */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className={`aspect-square relative rounded-lg overflow-hidden border-2 cursor-pointer transition-colors ${
                    image.id === mainImage?.id
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={`${product.name} - Imagem ${image.id}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          {product.description && (
            <p className="text-muted-foreground mb-6">{product.description}</p>
          )}

          {/* Price */}
          {price && (
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">
                  R$ {(price / 100).toFixed(2).replace(".", ",")}
                </span>
                {originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    R$ {(originalPrice / 100).toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Variations */}
          {variations.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Variações disponíveis:</h3>
              <div className="space-y-2">
                {variations.map((variation) => (
                  <Card
                    key={variation.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedVariation?.id === variation.id
                        ? "border-primary border-2"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedVariation(variation)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {variation.color} - {variation.size}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Estoque: {variation.stock} unidades
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          R${" "}
                          {((variation.discountPrice || variation.price) / 100)
                            .toFixed(2)
                            .replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Stock Info */}
          {selectedVariation && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {selectedVariation.stock > 0
                  ? `${selectedVariation.stock} unidades disponíveis`
                  : "Produto fora de estoque"}
              </p>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="w-full"
            disabled={!selectedVariation || selectedVariation.stock === 0}
            onClick={() => {
              if (!selectedVariation || !product) return;

              if (!canAddItem(product.storeId)) {
                toast.error(
                  "Não é possível adicionar produtos de lojas diferentes ao carrinho. Finalize o pedido atual ou limpe o carrinho.",
                );
                return;
              }

              if (selectedVariation.stock === 0) {
                toast.error("Produto fora de estoque");
                return;
              }

              try {
                addItem(product, selectedVariation, 1);
                toast.success("Produto adicionado ao carrinho!");
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Erro ao adicionar ao carrinho",
                );
              }
            }}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Adicionar ao carrinho
          </Button>
        </div>
      </div>
    </div>
  );
}

