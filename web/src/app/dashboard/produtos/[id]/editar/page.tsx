"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { productsService } from "@/services/products-service";
import { storesService } from "@/services/stores-service";
import { categoriesService } from "@/services/categories-service";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { ProductVariationsModal } from "@/components/product-variations-modal";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  categoryId: z.string().uuid("Categoria é obrigatória"),
  price: z.number().int("Preço deve ser um número inteiro (em centavos)").min(0, "Preço não pode ser negativo").optional(),
  quantity: z.number().int("Quantidade deve ser um número inteiro").min(0, "Quantidade não pode ser negativa").optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isVariationsModalOpen, setIsVariationsModalOpen] = useState(false);

  // Get product data
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productsService.findById(productId),
    enabled: !!productId,
  });

  // Get user's store
  const { data: storesData } = useQuery({
    queryKey: ["stores", "user", user?.id],
    queryFn: () => storesService.findAll(),
    enabled: !!user,
  });

  const userStore = storesData?.stores.find(
    (store) => store.ownerId === user?.id,
  );

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

  const onSubmit = async (data: ProductFormData) => {
    updateMutation.mutate(data);
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

  if (!userStore) {
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Editar Produto</h1>
        <Button
          variant="outline"
          onClick={() => setIsVariationsModalOpen(true)}
        >
          Gerenciar Variações
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Nome do Produto *</FieldLabel>
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
            <FieldLabel htmlFor="categoryId">Categoria *</FieldLabel>
            <select
              id="categoryId"
              {...register("categoryId")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/produtos")}
              >
                Cancelar
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </form>

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

