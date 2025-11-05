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
import { SkeletonStoreCard, SkeletonCard } from "@/components/skeleton-loader";
import { Pagination } from "@/components/pagination";
import { slugToText } from "@/lib/slug";
import { useState, useMemo } from "react";
import { StoreCard } from "@/components/store-card";

export default function CityPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const citySlug = params.city as string;
  const cityName = slugToText(citySlug);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [storesPage, setStoresPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const itemsPerPage = 12;

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

  // Buscar quantidade de produtos por loja
  const storeProductCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    stores.forEach((store) => {
      counts[store.id] = allProducts.filter((p) => p.storeId === store.id).length;
    });
    return counts;
  }, [stores, allProducts]);

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

  // Paginação de lojas
  const storesTotalPages = Math.ceil(stores.length / itemsPerPage);
  const paginatedStores = stores.slice(
    (storesPage - 1) * itemsPerPage,
    storesPage * itemsPerPage
  );
  
  // Paginação de produtos
  const productsTotalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (productsPage - 1) * itemsPerPage,
    productsPage * itemsPerPage
  );

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonStoreCard key={i} />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma loja encontrada nesta cidade
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedStores.map((store) => {
                const storeCity = citiesData?.cities.find((c) => c.id === store.cityId);
                return (
                  <StoreCard
                    key={store.id}
                    store={store}
                    cityName={storeCity?.name}
                    cityState={storeCity?.state}
                    productCount={storeProductCounts[store.id]}
                    citySlug={citySlug}
                  />
                );
              })}
            </div>
          </>
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
                setProductsPage(1);
              }}
            >
              Limpar filtros
            </Button>
          )}
        </div>
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
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
      </section>
    </div>
  );
}

