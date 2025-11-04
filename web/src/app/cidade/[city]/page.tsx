"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { storesService } from "@/services/stores-service";
import { productsService } from "@/services/products-service";
import { useCity } from "@/contexts/city-context";
import { Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function CityPage() {
  const params = useParams();
  const { selectedCity } = useCity();
  const citySlug = params.city as string;

  // Find city by name (slug) - for now we'll use selectedCity or search
  const cityName = citySlug.replace(/-/g, " ");

  const { data: storesData, isLoading: isLoadingStores } = useQuery({
    queryKey: ["stores", "city", citySlug],
    queryFn: () =>
      storesService.findAll({
        // We'll need to find cityId first, for now using city name search
        name: cityName,
      }),
    enabled: !!citySlug,
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", "city", citySlug],
    queryFn: () =>
      productsService.findAll({
        // We'll need cityId for proper filtering
        limit: 12,
      }),
    enabled: !!citySlug,
  });

  const stores = storesData?.stores || [];
  const products = productsData?.products || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Lojas em {cityName}
        </h1>
        <p className="text-muted-foreground">
          Descubra lojas e produtos da sua cidade
        </p>
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
        <h2 className="text-2xl font-semibold mb-4">Produtos em Destaque</h2>
        {isLoadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum produto encontrado nesta cidade
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
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

