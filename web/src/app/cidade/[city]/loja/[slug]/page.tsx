"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { storesService } from "@/services/stores-service";
import { productsService } from "@/services/products-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Store,
  Loader2,
  Instagram,
  Facebook,
  MessageCircle,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function StorePage() {
  const params = useParams();
  const citySlug = params.city as string;
  const storeSlug = params.slug as string;

  const { data: store, isLoading: isLoadingStore } = useQuery({
    queryKey: ["store", "slug", storeSlug],
    queryFn: () => storesService.findBySlug(storeSlug),
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", "store", store?.id],
    queryFn: () => productsService.findByStoreId(store!.id),
    enabled: !!store?.id,
  });

  const products = productsData || [];

  if (isLoadingStore) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loja não encontrada</h1>
          <p className="text-muted-foreground mb-4">
            A loja que você está procurando não existe.
          </p>
          <Link href={`/cidade/${citySlug}`}>
            <Button>Voltar para a cidade</Button>
          </Link>
        </div>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${store.whatsapp.replace(/\D/g, "")}`;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Store Header */}
      <div className="mb-8">
        {store.bannerUrl ? (
          <div className="relative h-64 w-full rounded-lg overflow-hidden mb-6">
            <Image
              src={store.bannerUrl}
              alt={store.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-64 w-full bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-6">
            <Store className="h-24 w-24 text-primary" />
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {store.logoUrl && (
            <div className="relative h-32 w-32 flex-shrink-0">
              <Image
                src={store.logoUrl}
                alt={store.name}
                fill
                className="object-contain rounded-lg border border-border"
              />
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
            {store.description && (
              <p className="text-muted-foreground mb-4">{store.description}</p>
            )}

            <div className="flex flex-wrap gap-4 mb-4">
              {store.instagramUrl && (
                <a
                  href={store.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="text-sm">Instagram</span>
                </a>
              )}
              {store.facebookUrl && (
                <a
                  href={store.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="text-sm">Facebook</span>
                </a>
              )}
            </div>

            <div className="flex gap-4">
              <Button asChild>
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
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Produtos</h2>
        {isLoadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Esta loja ainda não possui produtos cadastrados
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link
                  href={`/cidade/${citySlug}/produto/${product.id}`}
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
        )}
      </section>
    </div>
  );
}

