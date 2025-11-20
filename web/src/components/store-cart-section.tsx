"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCart, type StoreCart } from "@/contexts/cart-context";
import { storesService } from "@/services/stores-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trash2, CheckCircle2, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface StoreCartSectionProps {
  storeCart: StoreCart;
  citySlug?: string;
  onCheckout: (storeId: string) => void;
}

export function StoreCartSection({ storeCart, citySlug, onCheckout }: StoreCartSectionProps) {
  const { removeItem, updateQuantity, clearStore, getTotal, getItemCount, isRequested } = useCart();

  const { data: store, isLoading: isLoadingStore } = useQuery({
    queryKey: ["store", storeCart.storeId],
    queryFn: () => storesService.findById(storeCart.storeId),
    enabled: !!storeCart.storeId,
    retry: false,
  });

  const storeTotal = useMemo(() => getTotal(storeCart.storeId), [getTotal, storeCart.storeId]);
  const storeItemCount = useMemo(() => getItemCount(storeCart.storeId), [getItemCount, storeCart.storeId]);
  const requested = isRequested(storeCart.storeId);

  if (isLoadingStore) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        </div>
      </Card>
    );
  }

  if (!store) {
    return null;
  }

  return (
    <Card className={cn(
      "p-4 space-y-4",
      requested && "border-primary/30 bg-primary/5 dark:bg-primary/10"
    )}>
      {/* Header da Loja */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          {store.logoUrl ? (
            <div className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={store.logoUrl}
                alt={store.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Store className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{store.name}</h3>
              {requested && (
                <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30 text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Solicitado
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {storeItemCount} {storeItemCount === 1 ? "item" : "itens"}
            </p>
          </div>
        </div>
        {!requested && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearStore(storeCart.storeId)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Itens do Carrinho */}
      <div className="space-y-3">
        {storeCart.items.map((item) => {
          const price = item.variation.discountPrice || item.variation.price;
          const itemTotal = price * item.quantity;

          return (
            <div
              key={item.variation.id}
              className={cn(
                "flex gap-3 p-3 rounded-lg border border-border",
                requested && "opacity-60"
              )}
            >
              {item.product.imageUrl && (
                <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1 truncate">
                  {item.product.name}
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {item.variation.color} - {item.variation.size}
                </p>
                {!requested && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        updateQuantity(
                          storeCart.storeId,
                          item.variation.id,
                          item.quantity - 1,
                        )
                      }
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium w-6 text-center">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        updateQuantity(
                          storeCart.storeId,
                          item.variation.id,
                          item.quantity + 1,
                        )
                      }
                      disabled={item.quantity >= item.variation.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {requested && (
                  <p className="text-xs text-muted-foreground">
                    Quantidade: {item.quantity}
                  </p>
                )}
                <p className="text-sm font-semibold mt-1">
                  R$ {(itemTotal / 100).toFixed(2).replace(".", ",")}
                </p>
              </div>
              {!requested && (
                <button
                  onClick={() => removeItem(storeCart.storeId, item.variation.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors self-start mt-1"
                  aria-label="Remover item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Total e Ações */}
      <div className="pt-3 border-t border-border space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total da Loja:</span>
          <span className="text-lg font-bold">
            R$ {(storeTotal / 100).toFixed(2).replace(".", ",")}
          </span>
        </div>
        {!requested && (
          <Button
            className="w-full"
            onClick={() => onCheckout(storeCart.storeId)}
          >
            Finalizar Pedido
          </Button>
        )}
        {requested && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Pedido solicitado com sucesso!</span>
          </div>
        )}
      </div>
    </Card>
  );
}
