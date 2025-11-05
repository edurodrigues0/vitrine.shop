"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { storesService } from "@/services/stores-service";
import { productsService } from "@/services/products-service";
import { citiesService } from "@/services/cities-service";
import { categoriesService } from "@/services/categories-service";
import { Store, Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { slugToText } from "@/lib/slug";
import { useState, useMemo } from "react";

export default function CityPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const citySlug = params.city as string;
  const cityName = slugToText(citySlug);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Buscar cidade por nome para obter o cityId
  const { data: citiesData } = useQuery({
    queryKey: ["cities"],
    queryFn: () => citiesService.findAll(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Encontrar a cidade pelo slug
  const city = citiesData?.cities.find((c) => {
    const citySlugFromName = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
    return citySlugFromName === citySlug.toLowerCase();
  });

  // Buscar lojas da cidade
  const { data: storesData, isLoading: isLoadingStores } = useQuery({
    queryKey: ["stores", "city", city?.id],
    queryFn: () => {
      if (!city?.id) {
        return Promise.resolve({ stores: [], pagination: { totalItems: 0, totalPages: 0, currentPage: 1, perPage: 10 } });
      }
      // Buscar todas as lojas e filtrar por cityId no frontend
      // (assumindo que o backend não tem filtro por cityId ainda)
      return storesService.findAll({ limit: 100, cityId: city.id });
    },
    enabled: !!city,
  });

  // Buscar categorias
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesService.findAll(),
  });

  const categories = categoriesData?.categories || [];

  // Buscar produtos das lojas da cidade
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", "city", city?.id, searchTerm],
    queryFn: () => productsService.findAll({ limit: 100 }),
    enabled: !!city,
  });

  const stores = storesData?.stores || [];
  const allProducts = productsData?.products || [];

  // Filtrar produtos
  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filtrar por categoria
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.categoryId === selectedCategory,
      );
    }

    // Filtrar apenas produtos das lojas da cidade
    const storeIds = stores.map((store) => store.id);
    filtered = filtered.filter((product) => storeIds.includes(product.storeId));

    return filtered;
  }, [allProducts, searchTerm, selectedCategory, stores]);

  if (!city && citiesData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Cidade não encontrada</h1>
          <p className="text-muted-foreground mb-4">
            A cidade que você está procurando não existe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Lojas em {city?.name || cityName}
        </h1>
        <p className="text-muted-foreground mb-6">
          {city?.state && `${city.state} - `}Descubra lojas e produtos da sua cidade
        </p>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex h-10 w-full md:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stores Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Lojas</h2>
        {isLoadingStores ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma loja encontrada nesta cidade
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Card key={store.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/cidade/${citySlug}/loja/${store.slug}`}>
                  {store.bannerUrl ? (
                    <div className="relative h-32 w-full">
                      <Image
                        src={store.bannerUrl}
                        alt={store.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-32 w-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                      <Store className="h-12 w-12 text-primary" />
                    </div>
                  )}
                  <div className="p-4">
                    {store.logoUrl && (
                      <div className="relative h-16 w-16 mb-3">
                        <Image
                          src={store.logoUrl}
                          alt={store.name}
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-lg mb-1">{store.name}</h3>
                    {store.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {store.description}
                      </p>
                    )}
                    <Button variant="outline" className="w-full">
                      Ver loja
                    </Button>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Products Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">
            Produtos {searchTerm || selectedCategory ? "Filtrados" : "em Destaque"}
          </h2>
          {(searchTerm || selectedCategory) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
              }}
            >
              Limpar filtros
            </Button>
          )}
        </div>
        {isLoadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory
                ? "Nenhum produto encontrado com os filtros aplicados"
                : "Nenhum produto encontrado nesta cidade"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.slice(0, 12).map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <Link href={`/cidade/${citySlug}/produto/${product.id}`}>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

