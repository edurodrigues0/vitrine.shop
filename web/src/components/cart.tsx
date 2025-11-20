"use client";

import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { CheckoutModal } from "@/components/checkout-modal";
import { StoreCartSection } from "@/components/store-cart-section";

interface CartProps {
  citySlug?: string;
}

export function Cart({ citySlug }: CartProps) {
  const {
    stores,
    getStores,
    getTotal,
    getItemCount,
    clearAll,
  } = useCart();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const storeIds = useMemo(() => getStores(), [getStores]);
  const total = useMemo(() => getTotal(), [getTotal]);
  const itemCount = useMemo(() => getItemCount(), [getItemCount]);

  const handleCheckout = (storeId: string) => {
    setSelectedStoreId(storeId);
    setIsOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    setSelectedStoreId(null);
  };

  if (storeIds.length === 0) {
    return (
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div 
              className="absolute right-0 top-full mt-2 z-50 w-96 border border-border rounded-lg shadow-lg p-4 bg-background"
              style={{ backgroundColor: 'hsl(var(--popover))' }}
            >
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Carrinho vazio</p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="absolute right-0 top-full mt-2 z-50 w-96 max-h-[80vh] border border-border rounded-lg shadow-lg flex flex-col bg-background overflow-hidden"
            style={{ backgroundColor: 'hsl(var(--popover))' }}
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-semibold">Carrinho</h3>
                <p className="text-xs text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "itens"} • {storeIds.length} {storeIds.length === 1 ? "loja" : "lojas"}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fechar carrinho"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conteúdo - Seções por Loja */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {storeIds.map((storeId) => {
                const storeCart = stores[storeId];
                if (!storeCart || storeCart.items.length === 0) return null;

                return (
                  <StoreCartSection
                    key={storeId}
                    storeCart={storeCart}
                    citySlug={citySlug}
                    onCheckout={handleCheckout}
                  />
                );
              })}
            </div>

            {/* Footer - Total Geral */}
            {storeIds.length > 1 && (
              <div className="p-4 border-t border-border space-y-3 flex-shrink-0 bg-muted/30">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Geral:</span>
                  <span className="text-xl font-bold">
                    R$ {(total / 100).toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    clearAll();
                    setIsOpen(false);
                  }}
                >
                  Limpar Tudo
                </Button>
              </div>
            )}
          </div>
        </>
      )}
      
      {selectedStoreId && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={handleCloseCheckout}
          storeId={selectedStoreId}
          citySlug={citySlug}
        />
      )}
    </div>
  );
}