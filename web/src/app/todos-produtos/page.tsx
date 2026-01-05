"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products-service";
import { storesService } from "@/services/stores-service";
import { citiesService } from "@/services/cities-service";
import { categoriesService } from "@/services/categories-service";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Package, X, SlidersHorizontal, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ProdutosPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStoreId, setSelectedStoreId] = useState("");
    const [selectedCityId, setSelectedCityId] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [page, setPage] = useState(1);
    const itemsPerPage = 30;

    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const requestLocation = () => {
        setIsLocating(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                    setIsLocating(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setIsLocating(false);
                    // TODO: Show toast error
                }
            );
        } else {
            setIsLocating(false);
            // TODO: Show toast error (geolocation not supported)
        }
    };

    // Buscar produtos
    const { data: productsData, isLoading: isLoadingProducts } = useQuery({
        queryKey: ["products", "all", searchQuery, selectedStoreId, selectedCityId, selectedCategoryId, page, userLocation],
        queryFn: () =>
            productsService.findAll({
                page,
                limit: itemsPerPage,
                name: searchQuery || undefined,
                storeId: selectedStoreId || undefined,
                cityId: selectedCityId || undefined,
                categoryId: selectedCategoryId || undefined,
                latitude: userLocation?.lat,
                longitude: userLocation?.lng,
            }),
    });

    // Buscar lojas
    const { data: storesData } = useQuery({
        queryKey: ["stores", "all"],
        queryFn: () => storesService.findAll({ page: 1, limit: 100 }),
    });

    // Buscar cidades
    const { data: citiesData } = useQuery({
        queryKey: ["cities"],
        queryFn: () => citiesService.findAll(),
        staleTime: 1000 * 60 * 60,
    });

    // Buscar categorias
    const { data: categoriesData } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoriesService.findAll(),
        staleTime: 1000 * 60 * 60,
    });

    const products = productsData?.products || [];
    const stores = storesData?.stores || [];
    const cities = citiesData?.cities || [];
    const categories = categoriesData?.categories || [];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(price / 100);
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedStoreId("");
        setSelectedCityId("");
        setSelectedCategoryId("");
        setMinPrice("");
        setMaxPrice("");
        setUserLocation(null);
        setPage(1);
    };

    const hasActiveFilters = searchQuery || selectedStoreId || selectedCityId || selectedCategoryId || minPrice || maxPrice || userLocation;

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Todos os Produtos</h1>
                        <p className="text-muted-foreground">
                            Explore nossa seleção completa de produtos
                        </p>
                    </div>
                    <Button
                        variant={userLocation ? "default" : "outline"}
                        onClick={requestLocation}
                        disabled={isLocating}
                        className="flex items-center gap-2"
                    >
                        {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                        {userLocation ? "Localização Ativa" : "Usar minha localização"}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar de Filtros */}
                    <aside className="lg:col-span-1">
                        <Card className="p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <SlidersHorizontal className="h-5 w-5" />
                                    Filtros
                                </h2>
                                {hasActiveFilters && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="text-xs"
                                    >
                                        Limpar
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Busca */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Buscar</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            placeholder="Nome do produto..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setPage(1);
                                            }}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                {/* Loja */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Loja</label>
                                    <select
                                        value={selectedStoreId}
                                        onChange={(e) => {
                                            setSelectedStoreId(e.target.value);
                                            setPage(1);
                                        }}
                                        className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="">Todas as lojas</option>
                                        {stores.map((store) => (
                                            <option key={store.id} value={store.id}>
                                                {store.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Cidade */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Cidade</label>
                                    <select
                                        value={selectedCityId}
                                        onChange={(e) => {
                                            setSelectedCityId(e.target.value);
                                            setPage(1);
                                        }}
                                        className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="">Todas as cidades</option>
                                        {cities.map((city) => (
                                            <option key={city.id} value={city.id}>
                                                {city.name} - {city.state}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Categoria */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Categoria</label>
                                    <select
                                        value={selectedCategoryId}
                                        onChange={(e) => {
                                            setSelectedCategoryId(e.target.value);
                                            setPage(1);
                                        }}
                                        className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="">Todas as categorias</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Faixa de Preço */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Faixa de Preço</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Mín"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="text-sm"
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Máx"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </aside>

                    {/* Grid de Produtos */}
                    <div className="lg:col-span-3">
                        {isLoadingProducts ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : products.length === 0 ? (
                            <Card className="p-12 text-center">
                                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-semibold mb-2">Nenhum produto encontrado</p>
                                <p className="text-muted-foreground mb-4">
                                    Tente ajustar os filtros ou buscar por outros termos
                                </p>
                                {hasActiveFilters && (
                                    <Button onClick={clearFilters} variant="outline">
                                        Limpar filtros
                                    </Button>
                                )}
                            </Card>
                        ) : (
                            <>
                                <div className="mb-4 flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        {products.length} {products.length === 1 ? "produto encontrado" : "produtos encontrados"}
                                    </p>
                                    {userLocation && (
                                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            Ordenado por proximidade
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {products.map((product) => (
                                        <Link
                                            key={product.id}
                                            href={product.storeSlug && product.citySlug
                                                ? `/cidade/${product.citySlug}/loja/${product.storeSlug}/produto/${product.id}`
                                                : `/todos-produtos/${product.id}`
                                            }
                                        >
                                            <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                                                <div className="aspect-square bg-muted relative">
                                                    {product.imageUrl ? (
                                                        <Image
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="h-16 w-16 text-muted-foreground opacity-50" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-4 flex flex-col flex-1">
                                                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                        {product.name}
                                                    </h3>

                                                    {product.color && (
                                                        <p className="text-xs text-muted-foreground mb-2">
                                                            Cor: {product.color}
                                                        </p>
                                                    )}

                                                    {product.description && (
                                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
                                                            {product.description}
                                                        </p>
                                                    )}

                                                    <div className="mt-auto pt-2 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-xl font-bold text-primary">
                                                                {formatPrice(product.price || 0)}
                                                            </div>
                                                            {product.quantity !== undefined && product.quantity > 0 && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    {product.quantity} em estoque
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Button className="w-full" variant="secondary">
                                                            Ver Detalhes
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>

                                {/* Paginação */}
                                {productsData?.meta && productsData.meta.totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                        >
                                            Anterior
                                        </Button>
                                        <span className="text-sm text-muted-foreground">
                                            Página {page} de {productsData.meta.totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setPage((p) =>
                                                    Math.min(productsData.meta.totalPages, p + 1),
                                                )
                                            }
                                            disabled={page === productsData.meta.totalPages}
                                        >
                                            Próxima
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
