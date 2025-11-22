"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, MapPin, Loader2, ShoppingBag, Filter, X } from "lucide-react";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { productsService } from "@/services/products-service";
import { productVariationsService } from "@/services/product-variations-service";
import { citiesService } from "@/services/cities-service";
import type { Product } from "@/dtos/product";
import type { ProductVariation } from "@/dtos/product-variation";
import type { City } from "@/dtos/city";
import { useDebounce } from "@/hooks/use-debounce";

interface ProductWithVariations extends Product {
    variations?: ProductVariation[];
}

export function ProductSearch() {
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<ProductWithVariations[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedCityId, setSelectedCityId] = useState<string>("");
    const [showFilters, setShowFilters] = useState(false);
    const debouncedSearch = useDebounce(searchQuery, 300);
    const router = useRouter();

    // Carregar cidades ao montar o componente
    useEffect(() => {
        const loadCities = async () => {
            try {
                const response = await citiesService.findAll();
                setCities(response.cities || []);
            } catch (error) {
                console.error("Erro ao carregar cidades:", error);
            }
        };
        loadCities();
    }, []);

    // Buscar produtos quando o termo de busca ou cidade mudar
    const searchProducts = useCallback(async (query: string, cityId?: string) => {
        if (!query.trim()) {
            setProducts([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await productsService.findAll({
                name: query,
                limit: 6,
                cityId: cityId || undefined,
            });

            // Buscar variações para cada produto
            const productsWithVariations = await Promise.all(
                response.products.map(async (product) => {
                    try {
                        const variationsResponse = await productVariationsService.findByProductId(product.id);
                        return {
                            ...product,
                            variations: variationsResponse.productVariations || [],
                        };
                    } catch (error) {
                        // Se não houver variações, retornar o produto sem elas
                        return {
                            ...product,
                            variations: [],
                        };
                    }
                })
            );

            setProducts(productsWithVariations);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        searchProducts(debouncedSearch, selectedCityId);
    }, [debouncedSearch, selectedCityId, searchProducts]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(price / 100);
    };

    const getProductPrice = (product: ProductWithVariations) => {
        // Se tiver variações, pegar o menor preço
        if (product.variations && product.variations.length > 0) {
            const prices = product.variations.map((v) => v.discountPrice || v.price);
            return Math.min(...prices);
        }
        // Senão, usar o preço do produto
        return product.price || 0;
    };

    const getProductDetails = (product: ProductWithVariations) => {
        const details: string[] = [];

        if (product.variations && product.variations.length > 0) {
            // Coletar cores únicas
            const colors = [...new Set(product.variations.map((v) => v.color))];
            if (colors.length > 0 && colors[0]) {
                details.push(`Cores: ${colors.slice(0, 3).join(", ")}${colors.length > 3 ? "..." : ""}`);
            }

            // Coletar tamanhos únicos
            const sizes = [...new Set(product.variations.map((v) => v.size))];
            if (sizes.length > 0 && sizes[0]) {
                details.push(`Tamanhos: ${sizes.slice(0, 3).join(", ")}${sizes.length > 3 ? "..." : ""}`);
            }
        } else if (product.color) {
            details.push(`Cor: ${product.color}`);
        }

        return details;
    };

    const handleProductClick = (productId: string) => {
        router.push(`/todos-produtos/${productId}`);
    };

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-2xl transform rotate-6"></div>

            <Card className="relative p-8 border-2 border-border shadow-2xl bg-[hsl(var(--background))]" style={{ backgroundColor: 'hsl(var(--background))' }}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                                <ShoppingBag className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <div className="font-semibold text-foreground">
                                    Buscar Produtos
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {selectedCityId
                                        ? cities.find(c => c.id === selectedCityId)?.name || "Todas as cidades"
                                        : "Todas as cidades"}
                                </div>
                            </div>
                        </div>

                        {/* Filter Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2"
                        >
                            {showFilters ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                            {showFilters ? "Fechar" : "Filtros"}
                        </Button>
                    </div>

                    {/* Filters Section */}
                    {showFilters && (
                        <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Filtrar por Cidade
                                </label>
                                <select
                                    value={selectedCityId}
                                    onChange={(e) => setSelectedCityId(e.target.value)}
                                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                >
                                    <option value="">Todas as cidades</option>
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.id}>
                                            {city.name} - {city.state}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedCityId && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedCityId("")}
                                    className="w-full text-sm"
                                >
                                    Limpar filtro
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Digite o nome do produto..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-10 h-12 text-base bg-background border-2 focus:border-primary transition-colors"
                        />
                        {isLoading && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-spin" />
                        )}
                    </div>

                    {/* Results */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {searchQuery && !isLoading && products.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">Nenhum produto encontrado</p>
                                <p className="text-sm mt-1">Tente buscar por outro termo ou ajuste os filtros</p>
                            </div>
                        )}

                        {!searchQuery && !isLoading && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">Digite para buscar produtos</p>
                                <p className="text-sm mt-1">Encontre produtos da sua região</p>
                            </div>
                        )}

                        {products.map((product) => {
                            const price = getProductPrice(product);
                            const details = getProductDetails(product);

                            return (
                                <div
                                    key={product.id}
                                    onClick={() => handleProductClick(product.id)}
                                    className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-border hover:border-primary hover:shadow-lg transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                                {product.name}
                                            </h3>

                                            {details.length > 0 && (
                                                <div className="mt-1 space-y-0.5">
                                                    {details.map((detail, index) => (
                                                        <p
                                                            key={index}
                                                            className="text-xs text-muted-foreground"
                                                        >
                                                            {detail}
                                                        </p>
                                                    ))}
                                                </div>
                                            )}

                                            {product.description && (
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {product.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            <div className="text-lg font-bold text-primary">
                                                {formatPrice(price)}
                                            </div>
                                            {product.variations && product.variations.length > 1 && (
                                                <div className="text-xs text-muted-foreground">
                                                    {product.variations.length} variações
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Info */}
                    {products.length > 0 && (
                        <div className="pt-4 border-t border-border">
                            <p className="text-xs text-center text-muted-foreground">
                                Mostrando {products.length} {products.length === 1 ? "produto" : "produtos"}
                                {selectedCityId && ` em ${cities.find(c => c.id === selectedCityId)?.name}`}
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
