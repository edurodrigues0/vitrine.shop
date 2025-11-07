"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCart } from "@/contexts/cart-context";
import { storesService } from "@/services/stores-service";
import { ordersService } from "@/services/orders-service";
import { productVariationsService } from "@/services/product-variations-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Loader2, MessageCircle, Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const customerDataSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório"),
});

type CustomerDataForm = z.infer<typeof customerDataSchema>;

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  citySlug?: string;
}

export function CheckoutModal({ isOpen, onClose, citySlug }: CheckoutModalProps) {
  const { items, storeId, getTotal, clearCart } = useCart();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"customer" | "confirm">("customer");

  const { data: store, isLoading: isLoadingStore } = useQuery({
    queryKey: ["store", storeId],
    queryFn: () => storesService.findById(storeId!),
    enabled: !!storeId && isOpen,
  });

  const total = getTotal();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<CustomerDataForm>({
    resolver: zodResolver(customerDataSchema),
  });

  const customerData = watch();

  const createOrderMutation = useMutation({
    mutationFn: async (data: CustomerDataForm) => {
      if (!storeId) throw new Error("Loja não encontrada");

      // Verificar se há variações temporárias (IDs que começam com "default-")
      // e criar variações reais para elas ou usar variações existentes
      const itemsWithRealVariations = await Promise.all(
        items.map(async (item) => {
          // Se o ID da variação começa com "default-", é uma variação temporária
          if (item.variation.id.startsWith("default-")) {
            try {
              // Primeiro, verificar se já existe uma variação padrão para este produto
              const existingVariations = await productVariationsService.findByProductId(item.product.id);
              
              // Se já existe uma variação, usar a primeira
              if (existingVariations.productVariations && existingVariations.productVariations.length > 0) {
                const firstVariation = existingVariations.productVariations[0];
                return {
                  productVariationId: firstVariation.id,
                  quantity: item.quantity,
                };
              }
              
              // Se não existe, criar uma variação padrão real
              const defaultVariation = await productVariationsService.create({
                productId: item.product.id,
                color: item.variation.color || "Padrão",
                size: item.variation.size || "Único",
                price: item.variation.price,
                stock: item.variation.stock,
                discountPrice: item.variation.discountPrice || null,
              });
              
              return {
                productVariationId: defaultVariation.id,
                quantity: item.quantity,
              };
            } catch (error) {
              console.error("Erro ao criar/buscar variação:", error);
              // Se falhar ao criar variação (por exemplo, sem autenticação),
              // tentar usar o produto diretamente não funciona porque o pedido precisa de variation ID
              // Nesse caso, vamos lançar um erro mais claro
              throw new Error(
                "Não foi possível criar a variação do produto. Por favor, tente novamente ou entre em contato com o suporte."
              );
            }
          }
          
          // Se já é uma variação real, usar diretamente
          return {
            productVariationId: item.variation.id,
            quantity: item.quantity,
          };
        })
      );

      return await ordersService.create({
        storeId,
        customerName: data.name,
        customerPhone: data.whatsapp,
        items: itemsWithRealVariations,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["statistics"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setStep("confirm");
      toast.success("Pedido criado com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao criar pedido:", error);
      let errorMessage = "Erro ao criar pedido";
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.status === 404) {
        errorMessage = "Rota não encontrada. Verifique se o servidor está configurado corretamente.";
      } else if (error?.status === 401) {
        errorMessage = "Você precisa estar autenticado para criar um pedido.";
      } else if (error?.status === 400) {
        errorMessage = error?.data?.issues 
          ? `Erro de validação: ${error.data.issues.map((i: any) => i.message).join(", ")}`
          : "Erro de validação. Verifique os dados informados.";
      }
      
      toast.error(errorMessage);
    },
  });

  const whatsappMessage = useMemo(() => {
    if (!store || items.length === 0 || !customerData.name) return "";

    const itemsText = items
      .map(
        (item) =>
          `• ${item.product.name} (${item.variation.color} - ${item.variation.size}) x${item.quantity} - R$ ${((item.variation.discountPrice || item.variation.price) * item.quantity / 100).toFixed(2).replace(".", ",")}`,
      )
      .join("\n");

    return `Olá! Gostaria de fazer um pedido:\n\nCliente: ${customerData.name}\nWhatsApp: ${customerData.whatsapp}\n\nItens:\n${itemsText}\n\nTotal: R$ ${(total / 100).toFixed(2).replace(".", ",")}`;
  }, [store, items, total, customerData]);

  const whatsappUrl = useMemo(() => {
    if (!store) return "";
    const phone = store.whatsapp.replace(/\D/g, "");
    const message = encodeURIComponent(whatsappMessage);
    return `https://wa.me/${phone}?text=${message}`;
  }, [store, whatsappMessage]);

  const handleClose = () => {
    setStep("customer");
    reset();
    onClose();
  };

  const handleWhatsAppClick = () => {
    clearCart();
    handleClose();
    // Redirecionar após um breve delay para permitir o fechamento do modal
    setTimeout(() => {
      if (citySlug) {
        window.location.href = `/cidade/${citySlug}`;
      }
    }, 300);
  };

  if (!isOpen) return null;

  if (items.length === 0) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4 pointer-events-auto">
          <div className="sticky top-0 border-b border-border p-6 flex items-center justify-between bg-background z-10">
          <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {isLoadingStore ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !store ? (
            <div className="text-center py-12">
              <p className="text-destructive">Loja não encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Summary */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Resumo do Pedido</h3>
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
                            <h4 className="font-semibold">{item.product.name}</h4>
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
                  <h3 className="text-xl font-semibold mb-4">Loja</h3>
                  <div>
                    <h4 className="font-semibold mb-2">{store.name}</h4>
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
                {step === "customer" ? (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Dados do Cliente</h3>
                    <form
                      onSubmit={handleSubmit((data) => {
                        createOrderMutation.mutate(data);
                      })}
                      className="space-y-4"
                    >
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="name">Nome *</FieldLabel>
                          <Input
                            id="name"
                            {...register("name")}
                            aria-invalid={errors.name ? "true" : "false"}
                            placeholder="Seu nome completo"
                          />
                          {errors.name && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.name.message}
                            </p>
                          )}
                        </Field>

                        <Field>
                          <FieldLabel htmlFor="whatsapp">WhatsApp *</FieldLabel>
                          <Input
                            id="whatsapp"
                            {...register("whatsapp")}
                            aria-invalid={errors.whatsapp ? "true" : "false"}
                            placeholder="(00) 00000-0000"
                          />
                          {errors.whatsapp && (
                            <p className="text-sm text-destructive mt-1">
                              {errors.whatsapp.message}
                            </p>
                          )}
                        </Field>

                        <Button
                          type="submit"
                          className="w-full"
                          size="lg"
                          disabled={createOrderMutation.isPending}
                        >
                          {createOrderMutation.isPending
                            ? "Processando..."
                            : "Prosseguir com a solicitação"}
                        </Button>
                      </FieldGroup>
                    </form>
                  </Card>
                ) : (
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Finalizar Pedido</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Seu pedido foi registrado! Clique no botão abaixo para enviar
                      a mensagem para o WhatsApp da loja.
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
                          onClick={handleWhatsAppClick}
                        >
                          <MessageCircle className="h-5 w-5 mr-2" />
                          Realizar pedido no WhatsApp
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          clearCart();
                          handleClose();
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpar carrinho
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}

