"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/contexts/cart-context";
import { storesService } from "@/services/stores-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, Trash2 } from "lucide-react";
import { useMemo } from "react";

export default function CheckoutPage() {
  const params = useParams();
  const citySlug = params.city as string;
  const { items, storeId, getTotal, clearCart } = useCart();

  const { data: store, isLoading: isLoadingStore } = useQuery({
    queryKey: ["store", storeId],
    queryFn: () => storesService.findById(storeId!),
    enabled: !!storeId,
  });

  const total = getTotal();

  const whatsappMessage = useMemo(() => {
    if (!store || items.length === 0) return "";

    const itemsText = items
      .map(
        (item) =>
          `• ${item.product.name} (${item.variation.color} - ${item.variation.size}) x${item.quantity} - R$ ${((item.variation.discountPrice || item.variation.price) * item.quantity / 100).toFixed(2).replace(".", ",")}`,
      )
      .join("\n");

    return `Olá! Gostaria de fazer um pedido:\n\n${itemsText}\n\nTotal: R$ ${(total / 100).toFixed(2).replace(".", ",")}`;
  }, [store, items, total]);

  const whatsappUrl = useMemo(() => {
    if (!store) return "";
    const phone = store.whatsapp.replace(/\D/g, "");
    const message = encodeURIComponent(whatsappMessage);
    return `https://wa.me/${phone}?text=${message}`;
  }, [store, whatsappMessage]);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Carrinho vazio</h1>
          <p className="text-muted-foreground mb-4">
            Adicione produtos ao carrinho para finalizar o pedido.
          </p>
        </div>
      </div>
    );
  }

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
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Finalizar Pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Resumo do Pedido</h2>
            <div className="space-y-4">
              {items.map((item) => {
                const price =
                  item.variation.discountPrice || item.variation.price;
                const itemTotal = price * item.quantity;

                return (
                  <div
                    key={item.variation.id}
                    className="flex justify-between items-start pb-4 border-b border-border last:border-0"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.variation.color} - {item.variation.size}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        R$ {(itemTotal / 100).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold">
                  R$ {(total / 100).toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Loja</h2>
            <div>
              <h3 className="font-semibold mb-2">{store.name}</h3>
              {store.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {store.description}
                </p>
              )}
              <p className="text-sm">
                WhatsApp: {store.whatsapp}
              </p>
            </div>
          </Card>
        </div>

        {/* Checkout Actions */}
        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Finalizar</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Ao finalizar, você será redirecionado para o WhatsApp da loja
              com o pedido pronto para enviar.
            </p>
            <div className="space-y-2">
              <Button
                className="w-full"
                size="lg"
                asChild
              >
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Finalizar no WhatsApp
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={clearCart}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar carrinho
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

