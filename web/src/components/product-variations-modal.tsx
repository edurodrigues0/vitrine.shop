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
import { showError, showSuccess } from "@/lib/toast";
import { X, Plus, Edit, Trash2, Loader2, Save, XCircle, Check } from "lucide-react";
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
  const [editingVariationId, setEditingVariationId] = useState<string | null>(null);

  // Form state for creating
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
      showSuccess("Variação criada com sucesso!");
      resetForm();
      setIsCreating(false);
    },
    onError: (error: any) => {
      console.error("Create mutation error:", error);
      const errorMessage = error?.message || error?.response?.data?.message || "Erro ao criar variação";
      showError(errorMessage);
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
      showSuccess("Variação atualizada com sucesso!");
      setEditingVariationId(null);
    },
    onError: (error: Error) => {
      showError(error.message || "Erro ao atualizar variação");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await productVariationsService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variations", productId] });
      showSuccess("Variação excluída com sucesso!");
    },
    onError: (error: Error) => {
      showError(error.message || "Erro ao excluir variação");
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
    setEditingVariationId(null);
  };

  const handleCancelCreate = () => {
    resetForm();
    setIsCreating(false);
  };

  const handleStartEdit = (variationId: string) => {
    setEditingVariationId(variationId);
    setIsCreating(false);
  };

  const handleCancelEdit = () => {
    setEditingVariationId(null);
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.price || parseFloat(formData.price) <= 0) {
      showError("O preço é obrigatório e deve ser maior que zero");
      return;
    }

    if (!formData.stock || parseInt(formData.stock, 10) < 0) {
      showError("O estoque é obrigatório e não pode ser negativo");
      return;
    }

    const price = parseFloat(formData.price);
    const discountPrice = formData.discountPrice && parseFloat(formData.discountPrice) > 0
      ? parseFloat(formData.discountPrice)
      : null;
    const stock = parseInt(formData.stock, 10);

    createMutation.mutate({
      color: formData.color || "Padrão",
      size: formData.size || "Único",
      price,
      stock,
      discountPrice,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div 
          className="bg-background border border-border rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-hidden m-4 flex flex-col pointer-events-auto"
          style={{ backgroundColor: 'hsl(var(--background))' }}
        >
        {/* Header */}
        <div 
          className="sticky top-0 border-b border-border p-6 flex items-center justify-between bg-background z-10"
          style={{ backgroundColor: 'hsl(var(--background))' }}
        >
          <div>
            <h2 className="text-2xl font-bold">Gerenciar Variações do Produto</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Crie e gerencie as variações de cor, tamanho, preço e estoque
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/10">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Create Form Section */}
          {isCreating ? (
            <Card className="p-6 border-2 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Nova Variação
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelCreate}
                  className="hover:bg-destructive/10"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              <form onSubmit={handleSubmitCreate} className="space-y-4">
                <FieldGroup>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="create-color">Cor</FieldLabel>
                      <Input
                        id="create-color"
                        value={formData.color}
                        onChange={(e) =>
                          setFormData({ ...formData, color: e.target.value })
                        }
                        placeholder="Ex: Azul, Vermelho, Preto"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Deixe vazio para usar "Padrão"
                      </p>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="create-size">Tamanho</FieldLabel>
                      <Input
                        id="create-size"
                        value={formData.size}
                        onChange={(e) =>
                          setFormData({ ...formData, size: e.target.value })
                        }
                        placeholder="Ex: P, M, G, Único"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Deixe vazio para usar "Único"
                      </p>
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field>
                      <FieldLabel htmlFor="create-price">Preço (R$) *</FieldLabel>
                      <Input
                        id="create-price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                        required
                        placeholder="0.00"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="create-discountPrice">Preço com Desconto (R$)</FieldLabel>
                      <Input
                        id="create-discountPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.discountPrice}
                        onChange={(e) =>
                          setFormData({ ...formData, discountPrice: e.target.value })
                        }
                        placeholder="0.00"
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="create-stock">Estoque *</FieldLabel>
                      <Input
                        id="create-stock"
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({ ...formData, stock: e.target.value })
                        }
                        required
                        placeholder="0"
                      />
                    </Field>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="flex-1"
                    >
                      {createMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Criar Variação
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelCreate}
                      disabled={createMutation.isPending}
                    >
                      Cancelar
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </Card>
          ) : (
            <div className="flex justify-end">
              <Button onClick={handleStartCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Nova Variação
              </Button>
            </div>
          )}

          {/* Variations List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : variations.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-muted p-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Nenhuma variação cadastrada</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comece criando sua primeira variação de produto
                  </p>
                  <Button onClick={handleStartCreate} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Variação
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Variações Cadastradas ({variations.length})
                </h3>
              </div>
              <div className="grid gap-4">
                {variations.map((variation) => (
                  <VariationCard
                    key={variation.id}
                    variation={variation}
                    isEditing={editingVariationId === variation.id}
                    onStartEdit={() => handleStartEdit(variation.id)}
                    onCancelEdit={handleCancelEdit}
                    onUpdate={(data) => {
                      updateMutation.mutate({
                        id: variation.id,
                        data,
                      });
                    }}
                    onDelete={() => {
                      if (
                        confirm(
                          "Tem certeza que deseja excluir esta variação? Esta ação não pode ser desfeita."
                        )
                      ) {
                        deleteMutation.mutate(variation.id);
                      }
                    }}
                    isUpdating={updateMutation.isPending}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}

interface VariationCardProps {
  variation: ProductVariation;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onUpdate: (data: {
    color?: string;
    size?: string;
    price?: number;
    stock?: number;
    discountPrice?: number | null;
  }) => void;
  onDelete: () => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

function VariationCard({
  variation,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: VariationCardProps) {
  const [editData, setEditData] = useState({
    color: variation.color,
    size: variation.size,
    price: (variation.price / 100).toFixed(2),
    stock: variation.stock.toString(),
    discountPrice: variation.discountPrice ? (variation.discountPrice / 100).toFixed(2) : "",
  });

  useEffect(() => {
    if (isEditing) {
      setEditData({
        color: variation.color,
        size: variation.size,
        price: (variation.price / 100).toFixed(2),
        stock: variation.stock.toString(),
        discountPrice: variation.discountPrice ? (variation.discountPrice / 100).toFixed(2) : "",
      });
    }
  }, [isEditing, variation]);

  const handleSave = () => {
    const price = parseFloat(editData.price);
    const discountPrice = editData.discountPrice && parseFloat(editData.discountPrice) > 0
      ? parseFloat(editData.discountPrice)
      : null;
    const stock = parseInt(editData.stock, 10);

    if (price <= 0) {
      showError("O preço deve ser maior que zero");
      return;
    }

    if (stock < 0) {
      showError("O estoque não pode ser negativo");
      return;
    }

    onUpdate({
      color: editData.color || "Padrão",
      size: editData.size || "Único",
      price,
      stock,
      discountPrice,
    });
  };

  const hasChanges = () => {
    const priceChanged = parseFloat(editData.price) !== variation.price / 100;
    const stockChanged = parseInt(editData.stock, 10) !== variation.stock;
    const colorChanged = editData.color !== variation.color;
    const sizeChanged = editData.size !== variation.size;
    const discountPriceChanged = 
      (editData.discountPrice ? parseFloat(editData.discountPrice) : null) !== 
      (variation.discountPrice ? variation.discountPrice / 100 : null);

    return priceChanged || stockChanged || colorChanged || sizeChanged || discountPriceChanged;
  };

  return (
    <Card className={`p-5 transition-all ${isEditing ? 'border-2 border-primary shadow-md' : 'hover:shadow-md'}`}>
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Editando Variação</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isUpdating || !hasChanges()}
                className="gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="h-3 w-3" />
                    Salvar
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onCancelEdit}
                disabled={isUpdating}
                className="gap-2"
              >
                <XCircle className="h-3 w-3" />
                Cancelar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor={`edit-color-${variation.id}`}>Cor</FieldLabel>
              <Input
                id={`edit-color-${variation.id}`}
                value={editData.color}
                onChange={(e) =>
                  setEditData({ ...editData, color: e.target.value })
                }
                placeholder="Ex: Azul, Vermelho"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`edit-size-${variation.id}`}>Tamanho</FieldLabel>
              <Input
                id={`edit-size-${variation.id}`}
                value={editData.size}
                onChange={(e) =>
                  setEditData({ ...editData, size: e.target.value })
                }
                placeholder="Ex: P, M, G"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field>
              <FieldLabel htmlFor={`edit-price-${variation.id}`}>Preço (R$) *</FieldLabel>
              <Input
                id={`edit-price-${variation.id}`}
                type="number"
                step="0.01"
                min="0"
                value={editData.price}
                onChange={(e) =>
                  setEditData({ ...editData, price: e.target.value })
                }
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`edit-discountPrice-${variation.id}`}>Preço com Desconto (R$)</FieldLabel>
              <Input
                id={`edit-discountPrice-${variation.id}`}
                type="number"
                step="0.01"
                min="0"
                value={editData.discountPrice}
                onChange={(e) =>
                  setEditData({ ...editData, discountPrice: e.target.value })
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`edit-stock-${variation.id}`}>Estoque *</FieldLabel>
              <Input
                id={`edit-stock-${variation.id}`}
                type="number"
                min="0"
                value={editData.stock}
                onChange={(e) =>
                  setEditData({ ...editData, stock: e.target.value })
                }
                required
              />
            </Field>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Cor</div>
                  <div className="font-semibold text-base">{variation.color}</div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Tamanho</div>
                  <div className="font-semibold text-base">{variation.size}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Preço</div>
                <div className="font-bold text-lg text-foreground">
                  R$ {(variation.price / 100).toFixed(2).replace(".", ",")}
                </div>
                {variation.discountPrice && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground line-through">
                      R$ {(variation.price / 100).toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      R$ {(variation.discountPrice / 100).toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      {Math.round(((variation.price - variation.discountPrice) / variation.price) * 100)}% OFF
                    </span>
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Estoque</div>
                <div className={`font-semibold ${variation.stock === 0 ? 'text-destructive' : variation.stock < 10 ? 'text-yellow-600' : 'text-foreground'}`}>
                  {variation.stock} {variation.stock === 1 ? 'unidade' : 'unidades'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onStartEdit}
              className="hover:bg-primary/10 hover:border-primary"
              title="Editar variação"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onDelete}
              disabled={isDeleting}
              className="hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
              title="Excluir variação"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
