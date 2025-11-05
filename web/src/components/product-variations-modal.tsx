"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productVariationsService } from "@/services/product-variations-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "sonner";
import { X, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import type { ProductVariation } from "@/dtos/product-variation";

interface ProductVariationsModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
}

type VariationType = "color" | "size" | "both" | "none";

export function ProductVariationsModal({
  productId,
  isOpen,
  onClose,
}: ProductVariationsModalProps) {
  const queryClient = useQueryClient();
  const [variationType, setVariationType] = useState<VariationType>("none");
  const [isCreating, setIsCreating] = useState(false);
  const [editingVariation, setEditingVariation] = useState<string | null>(null);

  // Form state for creating/editing
  const [formData, setFormData] = useState({
    color: "",
    size: "",
    price: "",
    stock: "",
    discountPrice: "",
  });

  // Fetch variations
  const { data: variationsData, isLoading } = useQuery({
    queryKey: ["product-variations", productId],
    queryFn: () => productVariationsService.findByProductId(productId),
    enabled: isOpen && !!productId,
  });

  const variations = variationsData?.productVariations || [];

  const createMutation = useMutation({
    mutationFn: async (data: {
      color: string;
      size: string;
      price: number;
      stock: number;
      discountPrice?: number | null;
    }) => {
      try {
        const response = await productVariationsService.create({
          productId,
          color: data.color,
          size: data.size,
          price: data.price,
          stock: data.stock,
          discountPrice: data.discountPrice ? data.discountPrice : null,
        });
        return response;
      } catch (error) {
        console.error("Error creating variation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variations", productId] });
      toast.success("Variação criada com sucesso!");
      resetForm();
      setIsCreating(false);
    },
    onError: (error: any) => {
      console.error("Create mutation error:", error);
      const errorMessage = error?.message || error?.response?.data?.message || "Erro ao criar variação";
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        color?: string;
        size?: string;
        price?: number;
        stock?: number;
        discountPrice?: number | null;
      };
    }) => {
      return await productVariationsService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variations", productId] });
      toast.success("Variação atualizada com sucesso!");
      resetForm();
      setEditingVariation(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar variação");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await productVariationsService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variations", productId] });
      toast.success("Variação excluída com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao excluir variação");
    },
  });

  const resetForm = () => {
    setFormData({
      color: "",
      size: "",
      price: "",
      stock: "",
      discountPrice: "",
    });
  };

  const handleStartCreate = () => {
    resetForm();
    setIsCreating(true);
    setEditingVariation(null);
  };

  const handleStartEdit = (variation: ProductVariation) => {
    setFormData({
      color: variation.color,
      size: variation.size,
      price: (variation.price / 100).toFixed(2),
      stock: variation.stock.toString(),
      discountPrice: variation.discountPrice ? (variation.discountPrice / 100).toFixed(2) : "",
    });
    setEditingVariation(variation.id);
    setIsCreating(false);
  };

  const handleCancel = () => {
    resetForm();
    setIsCreating(false);
    setEditingVariation(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("O preço é obrigatório e deve ser maior que zero");
      return;
    }

    if (!formData.stock || parseInt(formData.stock, 10) < 0) {
      toast.error("O estoque é obrigatório e não pode ser negativo");
      return;
    }

    const priceInCents = Math.round(parseFloat(formData.price) * 100);
    const discountPriceInCents = formData.discountPrice && parseFloat(formData.discountPrice) > 0
      ? Math.round(parseFloat(formData.discountPrice) * 100)
      : null;
    const stock = parseInt(formData.stock, 10);

    if (editingVariation) {
      updateMutation.mutate({
        id: editingVariation,
        data: {
          color: formData.color || "Padrão",
          size: formData.size || "Único",
          price: priceInCents,
          stock,
          discountPrice: discountPriceInCents,
        },
      });
    } else {
      createMutation.mutate({
        color: formData.color || "Padrão",
        size: formData.size || "Único",
        price: priceInCents,
        stock,
        discountPrice: discountPriceInCents,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4" style={{ backgroundColor: 'hsl(var(--background))' }}>
        <div className="sticky top-0 border-b border-border p-6 flex items-center justify-between" style={{ backgroundColor: 'hsl(var(--background))' }}>
          <h2 className="text-2xl font-bold">Gerenciar Variações</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Variation Type Selection */}
          <div>
            <FieldLabel>Tipo de Variação</FieldLabel>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="variationType"
                  value="none"
                  checked={variationType === "none"}
                  onChange={() => setVariationType("none")}
                />
                <span>Sem variação</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="variationType"
                  value="color"
                  checked={variationType === "color"}
                  onChange={() => setVariationType("color")}
                />
                <span>Cor</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="variationType"
                  value="size"
                  checked={variationType === "size"}
                  onChange={() => setVariationType("size")}
                />
                <span>Tamanho</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="variationType"
                  value="both"
                  checked={variationType === "both"}
                  onChange={() => setVariationType("both")}
                />
                <span>Cor e Tamanho</span>
              </label>
            </div>
          </div>

          {/* Create/Edit Form */}
          {(isCreating || editingVariation) && (
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <FieldGroup>
                  {(variationType === "color" || variationType === "both") && (
                    <Field>
                      <FieldLabel htmlFor="color">Cor *</FieldLabel>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) =>
                          setFormData({ ...formData, color: e.target.value })
                        }
                        required
                      />
                    </Field>
                  )}

                  {(variationType === "size" || variationType === "both") && (
                    <Field>
                      <FieldLabel htmlFor="size">Tamanho *</FieldLabel>
                      <Input
                        id="size"
                        value={formData.size}
                        onChange={(e) =>
                          setFormData({ ...formData, size: e.target.value })
                        }
                        required
                      />
                    </Field>
                  )}

                  <Field>
                    <FieldLabel htmlFor="price">Preço (R$) *</FieldLabel>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="discountPrice">Preço com Desconto (R$)</FieldLabel>
                    <Input
                      id="discountPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.discountPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, discountPrice: e.target.value })
                      }
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="stock">Quantidade em Estoque *</FieldLabel>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      required
                    />
                  </Field>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingVariation
                        ? updateMutation.isPending
                          ? "Salvando..."
                          : "Salvar"
                        : createMutation.isPending
                          ? "Criando..."
                          : "Criar"}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </Card>
          )}

          {/* Create Button */}
          {!isCreating && !editingVariation && (
            <Button onClick={handleStartCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Variação
            </Button>
          )}

          {/* Variations List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : variations.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Nenhuma variação cadastrada. Clique em "Adicionar Variação" para criar uma.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Variações Cadastradas</h3>
              {variations.map((variation) => (
                <Card key={variation.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex gap-4 mb-2">
                        <div>
                          <span className="text-sm text-muted-foreground">Cor:</span>
                          <span className="ml-2 font-medium">{variation.color}</span>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Tamanho:</span>
                          <span className="ml-2 font-medium">{variation.size}</span>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Preço:</span>
                          <span className="ml-2 font-semibold">
                            R$ {(variation.price / 100).toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                        {variation.discountPrice && (
                          <div>
                            <span className="text-muted-foreground">Desconto:</span>
                            <span className="ml-2 font-semibold text-green-600">
                              R$ {(variation.discountPrice / 100).toFixed(2).replace(".", ",")}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Estoque:</span>
                          <span className="ml-2 font-semibold">{variation.stock}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleStartEdit(variation)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          if (
                            confirm(
                              "Tem certeza que deseja excluir esta variação?",
                            )
                          ) {
                            deleteMutation.mutate(variation.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

