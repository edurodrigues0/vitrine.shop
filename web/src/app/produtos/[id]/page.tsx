"use client";

import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products-service";
import { productVariationsService } from "@/services/product-variations-service";
import { storesService } from "@/services/stores-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Store as StoreIcon, MapPin, Phone, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { notFound } from "next/navigation";

interface ProductDetailsPageProps {
    params: {
        id: string;
    };
}

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
    const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);

    // Buscar produto
    const { data: product, isLoading: isLoadingProduct } = useQuery({
        queryKey: ["product", params.id],
        queryFn: () => productsService.findById(params.id),
    });

    // Buscar variações do produto
    const { data: variationsData } = useQuery({
        queryKey: ["product-variations", params.id],
        queryFn: () => productVariationsService.findByProductId(params.id),
        enabled: !!product,
    });

    // Buscar loja
    const { data: store } = useQuery({
        queryKey: ["store", product?.storeId],
        queryFn: () => storesService.findById(product!.storeId),
        enabled: !!product?.storeId,
    });

    const variations = variationsData?.productVariations || [];
    const selectedVariation = selectedVariationId
        ? variations.find((v) => v.id === selectedVariationId)
        : variations[0];

    if (isLoadingProduct) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!product) {
        notFound();
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(price / 100);
    };

    const currentPrice = selectedVariation?.discountPrice || selectedVariation?.price || product.price || 0;
    const hasDiscount = selectedVariation?.discountPrice && selectedVariation.discountPrice < selectedVariation.price;

    // Agrupar variações por atributo
    const colors = [...new Set(variations.map((v) => v.color).filter(Boolean))];
    const sizes = [...new Set(variations.map((v) => v.size).filter(Boolean))];

    const handleWhatsAppClick = () => {
        if (!store?.phone) return;

        const message = `Olá! Tenho interesse no produto: ${product.name}${selectedVariation ? ` (${selectedVariation.color || ''} ${selectedVariation.size || ''})` : ''}`;
        const whatsappUrl = `https://wa.me/${store.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Breadcrumb */}
                <div className="mb-6 text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-foreground">Home</Link>
                    {" / "}
                    <Link href="/produtos" className="hover:text-foreground">Produtos</Link>
                    {" / "}
                    <span className="text-foreground">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Imagem do Produto */}
                    <div>
                        <Card className="overflow-hidden">
                            <div className="aspect-square bg-muted relative">
                                {product.imageUrl ? (
                                    <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="h-24 w-24 text-muted-foreground opacity-50" />
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Informações do Produto */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                            {product.description && (
                                <p className="text-muted-foreground">{product.description}</p>
                            )}
                        </div>

                        {/* Preço */}
                        <div>
                            {hasDiscount && selectedVariation && (
                                <div className="text-lg text-muted-foreground line-through">
                                    {formatPrice(selectedVariation.price)}
                                </div>
                            )}
                            <div className="text-4xl font-bold text-primary">
                                {formatPrice(currentPrice)}
                            </div>
                            {hasDiscount && (
                                <div className="inline-block mt-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm font-semibold">
                                    {Math.round(((selectedVariation!.price - selectedVariation!.discountPrice!) / selectedVariation!.price) * 100)}% OFF
                                </div>
                            )}
                        </div>

                        {/* Variações - Cores */}
                        {colors.length > 0 && (
                            <div>
                                <label className="text-sm font-medium mb-2 block">Cor</label>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map((color) => {
                                        const variation = variations.find((v) => v.color === color);
                                        const isSelected = selectedVariation?.color === color;
                                        return (
                                            <button
                                                key={color}
                                                onClick={() => variation && setSelectedVariationId(variation.id)}
                                                className={`px-4 py-2 rounded-md border-2 transition-all ${isSelected
                                                        ? "border-primary bg-primary/10"
                                                        : "border-border hover:border-primary/50"
                                                    }`}
                                            >
                                                {color}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Variações - Tamanhos */}
                        {sizes.length > 0 && (
                            <div>
                                <label className="text-sm font-medium mb-2 block">Tamanho</label>
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map((size) => {
                                        const variation = variations.find((v) => v.size === size);
                                        const isSelected = selectedVariation?.size === size;
                                        return (
                                            <button
                                                key={size}
                                                onClick={() => variation && setSelectedVariationId(variation.id)}
                                                className={`px-4 py-2 rounded-md border-2 transition-all ${isSelected
                                                        ? "border-primary bg-primary/10"
                                                        : "border-border hover:border-primary/50"
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Estoque */}
                        {selectedVariation && (
                            <div className="text-sm">
                                {selectedVariation.stock > 0 ? (
                                    <span className="text-green-600 dark:text-green-400">
                                        ✓ {selectedVariation.stock} unidades em estoque
                                    </span>
                                ) : (
                                    <span className="text-red-600 dark:text-red-400">
                                        ✗ Fora de estoque
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Botão de Compra */}
                        <Button
                            onClick={handleWhatsAppClick}
                            disabled={!store?.phone || (selectedVariation && selectedVariation.stock === 0)}
                            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Phone className="h-5 w-5 mr-2" />
                            Comprar via WhatsApp
                        </Button>
                    </div>
                </div>

                {/* Informações da Loja */}
                {store && (
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <StoreIcon className="h-5 w-5" />
                            Sobre a Loja
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{store.name}</h3>
                                {store.description && (
                                    <p className="text-muted-foreground mb-4">{store.description}</p>
                                )}
                                {store.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4" />
                                        {store.phone}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-end">
                                <Link href={`/lojas/${store.slug}`}>
                                    <Button variant="outline">
                                        Ver Loja Completa
                                        <ExternalLink className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
