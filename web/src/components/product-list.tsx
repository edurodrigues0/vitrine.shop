"use client";

import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/products-service";
import type { FindAllProductsParams } from "@/dtos/product";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface ProductListProps {
  params?: FindAllProductsParams;
  citySlug?: string;
}

export function ProductList({ params, citySlug }: ProductListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products", params],
    queryFn: () => productsService.findAll(params),
  });

  const products = data?.products || [];

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
          Erro ao carregar produtos. Tente novamente.
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card
          key={product.id}
          className="overflow-hidden hover:shadow-lg transition-shadow"
        >
          <Link
            href={
              citySlug
                ? `/cidade/${citySlug}/produto/${product.id}`
                : `/produto/${product.id}`
            }
          >
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
  );
}

