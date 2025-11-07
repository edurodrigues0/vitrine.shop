"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { productsService } from "@/services/products-service";
import { categoriesService } from "@/services/categories-service";
import { productVariationsService } from "@/services/product-variations-service";
import { productImagesService } from "@/services/product-images-service";
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
import { useState } from "react";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  categoryId: z.string().uuid("Categoria é obrigatória"),
  price: z.number().min(0, "Preço não pode ser negativo").optional(),
  quantity: z.number().int("Quantidade deve ser um número inteiro").min(0, "Quantidade não pode ser negativa").optional(),
  color: z.string().max(50, "Cor deve ter no máximo 50 caracteres").optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const router = useRouter();
  const { selectedStore } = useSelectedStore();
  const queryClient = useQueryClient();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Get categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesService.findAll(),
  });

  const categories = categoriesData?.categories || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (!selectedStore) throw new Error("Loja não encontrada");
      
      // Criar produto
      const createData: any = {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        storeId: selectedStore.id,
      };

      // Convert price from reais to centavos if provided
      if (data.price !== undefined) {
        createData.price = Math.round(data.price * 100);
      }

      if (data.quantity !== undefined) {
        createData.quantity = data.quantity;
      }

      if (data.color !== undefined && data.color !== "") {
        createData.color = data.color;
      }

      const productResult = await productsService.create(createData);

      // Se houver imagens, criar uma variação padrão e fazer upload das imagens
      if (selectedImages.length > 0 && productResult.id) {
        try {
          // Criar variação padrão
          const variation = await productVariationsService.create({
            productId: productResult.id,
            price: 0, // Preço padrão, usuário pode editar depois
            stock: 0,
            color: "Padrão",
            size: "Único",
          });

          // Fazer upload das imagens
          for (const imageFile of selectedImages) {
            await productImagesService.create(imageFile, variation.id);
          }
        } catch (error) {
          console.error("Erro ao criar variação ou fazer upload de imagens:", error);
          // Não falhar o produto se houver erro nas imagens
        }
      }

      return productResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto criado com sucesso!");
      router.push("/dashboard/produtos");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar produto");
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.slice(0, 5 - selectedImages.length); // Máximo de 5 imagens
    
    setSelectedImages((prev) => [...prev, ...newFiles]);
    
    // Criar previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!selectedStore) {
      toast.error("Você precisa criar uma loja primeiro");
      return;
    }
    createMutation.mutate(data);
  };

  if (!selectedStore) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Criar Produto</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Você precisa criar uma loja antes de adicionar produtos.
          </p>
          <Button asChild>
            <a href="/dashboard/loja/cadastro">Criar Loja</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Criar Produto</h1>
        <p className="text-muted-foreground">
          Adicione um novo produto à sua loja
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Nome do Produto</FieldLabel>
            <Input
              id="name"
              {...register("name")}
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="description">Descrição</FieldLabel>
            <Input
              id="description"
              {...register("description")}
              aria-invalid={errors.description ? "true" : "false"}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">
                {errors.description.message}
              </p>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="categoryId">Categoria</FieldLabel>
            <select
              id="categoryId"
              {...register("categoryId")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            />
            {errors.color && (
              <p className="text-sm text-destructive mt-1">
                {errors.color.message}
              </p>
            )}
          </Field>
          
          <Field>
            <FieldLabel htmlFor="images">Imagens do Produto (máximo 5)</FieldLabel>
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
                  disabled={selectedImages.length >= 5}
                  className="hidden"
                />
              </div>
              
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remover imagem"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedImages.length === 0 && (
                <div className="flex items-center justify-center p-8 border border-dashed border-border rounded-md text-muted-foreground">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma imagem selecionada</p>
                  </div>
                </div>
              )}
            </div>
          </Field>
          
          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="submit"
              disabled={createMutation.isPending}
              size="lg"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Produto"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push("/dashboard/produtos")}
            >
              Cancelar
            </Button>
          </div>
        </FieldGroup>
      </form>
      </Card>
    </div>
  );
}

