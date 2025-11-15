"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { productsService } from "@/services/products-service";
import { categoriesService } from "@/services/categories-service";
import { useSelectedStore } from "@/hooks/use-selected-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ProductVariationsModal } from "@/components/product-variations-modal";
import { productVariationsService } from "@/services/product-variations-service";
import { productImagesService } from "@/services/product-images-service";
import { Image as ImageIcon, Upload, X as XIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  categoryId: z.string().uuid("Categoria é obrigatória"),
  price: z.number().int("Preço deve ser um número inteiro (em centavos)").min(0, "Preço não pode ser negativo").optional(),
  quantity: z.number().int("Quantidade deve ser um número inteiro").min(0, "Quantidade não pode ser negativa").optional(),
  color: z.string().max(50, "Cor deve ter no máximo 50 caracteres").optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { selectedStore } = useSelectedStore();
  const queryClient = useQueryClient();
  const [isVariationsModalOpen, setIsVariationsModalOpen] = useState(false);
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Get product data
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productsService.findById(productId),
    enabled: !!productId,
  });

  // Get categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesService.findAll(),
  });

  const categories = categoriesData?.categories || [];

  // Get variations for image management
  const { data: variationsData } = useQuery({
    queryKey: ["product-variations", productId],
    queryFn: () => productVariationsService.findByProductId(productId),
    enabled: !!productId,
  });

  const variations = variationsData?.productVariations || [];
  const firstVariation = variations[0];

  // Auto-select first variation for images
  useEffect(() => {
    if (firstVariation && !selectedVariationId) {
      setSelectedVariationId(firstVariation.id);
    }
  }, [firstVariation, selectedVariationId]);

  // Get images for selected variation
  const { data: imagesData, refetch: refetchImages } = useQuery({
    queryKey: ["product-images", selectedVariationId],
    queryFn: () =>
      productImagesService.findByProductVariationId(selectedVariationId!),
    enabled: !!selectedVariationId,
  });

  const existingImages = imagesData?.productImages || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  // Reset form when product data loads
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description || "",
        categoryId: product.categoryId,
        price: product.price ? product.price / 100 : undefined, // Convert from centavos to reais for display
        quantity: product.quantity,
        color: product.color || "",
      });
    }
  }, [product, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (!productId) throw new Error("ID do produto não encontrado");
      
      // Convert price from reais to centavos
      const updateData: any = {
        name: data.name,
        description: data.description || undefined,
        categoryId: data.categoryId,
      };

      if (data.price !== undefined) {
        updateData.price = Math.round(data.price * 100); // Convert to centavos
      }

      if (data.quantity !== undefined) {
        updateData.quantity = data.quantity;
      }

      if (data.color !== undefined && data.color !== "") {
        updateData.color = data.color;
      } else if (data.color === "") {
        updateData.color = null;
      }

      return await productsService.update(productId, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      toast.success("Produto atualizado com sucesso!");
      router.push("/dashboard/produtos");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar produto");
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.slice(0, 5 - existingImages.length - selectedImages.length);
    
    setSelectedImages((prev) => [...prev, ...newFiles]);
    
    // Create previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      await productImagesService.delete(imageId);
    },
    onSuccess: () => {
      refetchImages();
      toast.success("Imagem removida com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao remover imagem");
    },
  });

  const uploadImagesMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVariationId || selectedImages.length === 0) return;
      
      for (const imageFile of selectedImages) {
        await productImagesService.create(imageFile, selectedVariationId);
      }
    },
    onSuccess: () => {
      setSelectedImages([]);
      setImagePreviews([]);
      refetchImages();
      toast.success("Imagens adicionadas com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao fazer upload das imagens");
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    updateMutation.mutate(data);
    
    // Upload new images if any
    if (selectedImages.length > 0 && selectedVariationId) {
      uploadImagesMutation.mutate();
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Editar Produto</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Produto não encontrado.
          </p>
          <Button asChild>
            <a href="/dashboard/produtos">Voltar para Produtos</a>
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Editar Produto</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Você precisa criar uma loja antes de editar produtos.
          </p>
          <Button asChild>
            <a href="/dashboard/loja/cadastro">Criar Loja</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/produtos")}
            className="h-10 w-10"
            title="Voltar para lista de produtos"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold mb-2">Editar Produto</h1>
            <p className="text-muted-foreground">
              Atualize as informações do produto
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsVariationsModalOpen(true)}
          size="lg"
          className="border-2"
        >
          Gerenciar Variações
        </Button>
      </div>

      {/* Form Card */}
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel htmlFor="name">Nome do Produto *</FieldLabel>
                <Input
                  id="name"
                  {...register("name")}
                  aria-invalid={errors.name ? "true" : "false"}
                  className="h-11"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.name.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="categoryId">Categoria *</FieldLabel>
                <select
                  id="categoryId"
                  {...register("categoryId")}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.categoryId.message}
                  </p>
                )}
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="description">Descrição</FieldLabel>
              <textarea
                id="description"
                {...register("description")}
                aria-invalid={errors.description ? "true" : "false"}
                rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Descreva o produto..."
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel htmlFor="price">Preço (R$)</FieldLabel>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("price", { valueAsNumber: true })}
                  aria-invalid={errors.price ? "true" : "false"}
                  placeholder="0.00"
                  className="h-11"
                />
                {errors.price && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.price.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="quantity">Quantidade em Estoque</FieldLabel>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  {...register("quantity", { valueAsNumber: true })}
                  aria-invalid={errors.quantity ? "true" : "false"}
                  placeholder="0"
                  className="h-11"
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.quantity.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="color">Cor</FieldLabel>
                <Input
                  id="color"
                  {...register("color")}
                  aria-invalid={errors.color ? "true" : "false"}
                  placeholder="Ex: Azul, Vermelho, Preto"
                  className="h-11"
                />
                {errors.color && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.color.message}
                  </p>
                )}
              </Field>
            </div>

            {/* Image Management Section */}
            {variations.length > 0 && (
              <div className="pt-4 border-t">
                <Field>
                  <FieldLabel>Imagens do Produto</FieldLabel>
                  <div className="space-y-4">
                    {/* Variation Selector */}
                    <select
                      value={selectedVariationId || ""}
                      onChange={(e) => setSelectedVariationId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                    >
                      <option value="">Selecione uma variação</option>
                      {variations.map((variation) => (
                        <option key={variation.id} value={variation.id}>
                          {variation.color} - {variation.size}
                        </option>
                      ))}
                    </select>

                    {/* Existing Images */}
                    {selectedVariationId && existingImages.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Imagens Existentes:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {existingImages.map((image) => (
                            <div
                              key={image.id}
                              className="relative group aspect-square rounded-lg overflow-hidden border border-border"
                            >
                              <Image
                                src={image.url}
                                alt="Imagem do produto"
                                fill
                                className="object-cover"
                                unoptimized
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm("Tem certeza que deseja remover esta imagem?")) {
                                    deleteImageMutation.mutate(image.id);
                                  }
                                }}
                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                disabled={deleteImageMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add New Images */}
                    {selectedVariationId && (
                      <div>
                        <p className="text-sm font-medium mb-2">Adicionar Novas Imagens:</p>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor="images"
                              className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-md cursor-pointer hover:bg-accent transition-colors"
                            >
                              <Upload className="h-4 w-4" />
                              <span className="text-sm">Selecionar imagens</span>
                            </label>
                            <Input
                              id="images"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageChange}
                              disabled={existingImages.length + selectedImages.length >= 5}
                              className="hidden"
                            />
                          </div>
                          
                          {selectedImages.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {imagePreviews.map((preview, index) => (
                                <div
                                  key={index}
                                  className="relative group aspect-square rounded-lg overflow-hidden border border-border"
                                >
                                  <Image
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    fill
                                    className="object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeNewImage(index)}
                                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <XIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {selectedVariationId && existingImages.length === 0 && selectedImages.length === 0 && (
                            <div className="flex items-center justify-center p-8 border border-dashed border-border rounded-md text-muted-foreground">
                              <div className="text-center">
                                <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Nenhuma imagem selecionada</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Field>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                size="lg"
                className="flex-1 border-2 border-primary shadow-md hover:shadow-lg transition-shadow"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/produtos")}
                size="lg"
                className="border-2 hover:bg-destructive/10 hover:border-destructive/50 transition-colors"
                asChild
              >
                <Link href="/dashboard/produtos">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Link>
              </Button>
            </div>
          </FieldGroup>
        </form>
      </Card>

      {isVariationsModalOpen && product && (
        <ProductVariationsModal
          productId={product.id}
          isOpen={isVariationsModalOpen}
          onClose={() => setIsVariationsModalOpen(false)}
        />
      )}
    </div>
  );
}

