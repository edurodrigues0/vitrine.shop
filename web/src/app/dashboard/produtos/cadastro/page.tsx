"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  categoryId: z.string().uuid("Categoria é obrigatória"),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      if (!userStore) throw new Error("Loja não encontrada");
      return productsService.create({
        ...data,
        storeId: userStore.id,
      });
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

  const onSubmit = async (data: ProductFormData) => {
    if (!userStore) {
      toast.error("Você precisa criar uma loja primeiro");
      return;
    }
    createMutation.mutate(data);
  };

  if (!userStore) {
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
    <div>
      <h1 className="text-3xl font-bold mb-8">Criar Produto</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
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
            <Button
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Criando..." : "Criar Produto"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}

