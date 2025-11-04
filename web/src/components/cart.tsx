"use client";

import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface CartProps {
  citySlug?: string;
}

export function Cart({ citySlug }: CartProps) {
  const {
    items,
    storeId,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const total = getTotal();
  const itemCount = getItemCount();

  if (items.length === 0) {
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
            <div className="absolute right-0 top-full mt-2 z-50 w-96 bg-background border border-border rounded-lg shadow-lg p-4">
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
          <div className="absolute right-0 top-full mt-2 z-50 w-96 max-h-[600px] bg-background border border-border rounded-lg shadow-lg flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold">Carrinho ({itemCount})</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => {
                const price =
                  item.variation.discountPrice || item.variation.price;
                const itemTotal = price * item.quantity;

                return (
                  <Card key={item.variation.id} className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {item.variation.color} - {item.variation.size}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              updateQuantity(
                                item.variation.id,
                                item.quantity - 1,
                              )
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              updateQuantity(
                                item.variation.id,
                                item.quantity + 1,
                              )
                            }
                            disabled={item.quantity >= item.variation.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm font-semibold">
                          R${" "}
                          {(itemTotal / 100).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.variation.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="p-4 border-t border-border space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold">
                  R$ {(total / 100).toFixed(2).replace(".", ",")}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={clearCart}
                >
                  Limpar
                </Button>
                <Button
                  className="flex-1"
                  asChild
                >
                  <Link
                    href={
                      citySlug
                        ? `/cidade/${citySlug}/checkout`
                        : "/checkout"
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    Finalizar
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

