"use client";

import { useQuery } from "@tanstack/react-query";
import { storesService } from "@/services/stores-service";
import type { FindAllStoresParams } from "@/dtos/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface StoreListProps {
  params?: FindAllStoresParams;
  citySlug?: string;
}

export function StoreList({ params, citySlug }: StoreListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["stores", params],
    queryFn: () => storesService.findAll(params),
  });

  const stores = data?.stores || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">
          Erro ao carregar lojas. Tente novamente.
        </p>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-12">
        <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhuma loja encontrada</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stores.map((store) => (
        <Card
          key={store.id}
          className="overflow-hidden hover:shadow-lg transition-shadow"
        >
          <Link
            href={
              citySlug
                ? `/cidade/${citySlug}/loja/${store.slug}`
                : `/loja/${store.slug}`
            }
          >
            {store.bannerUrl ? (
              <div className="relative h-32 w-full">
                <Image
                  src={store.bannerUrl}
                  alt={store.name}
                  fill
                  className="object-cover"
                  unoptimized
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
                    unoptimized
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
  );
}

