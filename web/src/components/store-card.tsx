"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Instagram, MessageCircle, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Store as StoreType } from "@/dtos/store";

interface StoreCardProps {
  store: StoreType;
  cityName?: string;
  cityState?: string;
  productCount?: number;
  citySlug: string;
}

export function StoreCard({
  store,
  cityName,
  cityState,
  productCount,
  citySlug,
}: StoreCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/cidade/${citySlug}/loja/${store.slug}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="cursor-pointer" onClick={handleCardClick}>
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
              />
            </div>
          )}
          <h3 className="font-semibold text-lg mb-1">{store.name}</h3>
          {store.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {store.description}
            </p>
          )}
          
          {/* Informações adicionais */}
          <div className="space-y-2 mb-3">
            {cityName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{cityName}</span>
                {cityState && <span>• {cityState}</span>}
              </div>
            )}
            
            {productCount !== undefined && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Package className="h-3 w-3" />
                <span>{productCount} {productCount === 1 ? "produto" : "produtos"}</span>
              </div>
            )}
          </div>

          {/* Ícones de redes sociais */}
          {(store.instagramUrl || store.whatsapp) && (
            <div className="flex items-center gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
              {store.instagramUrl && (
                <a
                  href={store.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {store.whatsapp && (
                <a
                  href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
              )}
            </div>
          )}

          <Button variant="outline" className="w-full" asChild>
            <Link href={`/cidade/${citySlug}/loja/${store.slug}`} onClick={(e) => e.stopPropagation()}>
              Ver loja
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

