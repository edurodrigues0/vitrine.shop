"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { storesService } from "@/services/stores-service";
import { citiesService } from "@/services/cities-service";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { createSlug } from "@/lib/slug";
import { showSuccess, showError } from "@/lib/toast";
import { Loader2, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";

const storeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(120, "Nome muito longo"),
  description: z.string().optional(),
  slug: z.string().min(1, "Slug é obrigatório").max(120, "Slug muito longo"),
  cnpjcpf: z.string().min(1, "CNPJ/CPF é obrigatório").max(14, "CNPJ/CPF inválido"),
  whatsapp: z.string().min(1, "WhatsApp é obrigatório").max(20, "WhatsApp inválido"),
  instagramUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  facebookUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  bannerUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  cityId: z.string().uuid("Cidade é obrigatória"),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve estar no formato hexadecimal (#RRGGBB)"),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve estar no formato hexadecimal (#RRGGBB)"),
  tertiaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor deve estar no formato hexadecimal (#RRGGBB)"),
});

type StoreFormData = z.infer<typeof storeSchema>;

export default function StoreFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("id");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get cities
  const { data: citiesData, isLoading: isLoadingCities } = useQuery({
    queryKey: ["cities"],
    queryFn: () => citiesService.findAll(),
    staleTime: 1000 * 60 * 60,
  });

  const cities = citiesData?.cities || [];

  // Get store if editing
  const { data: storeData, isLoading: isLoadingStore } = useQuery({
    queryKey: ["store", storeId],
    queryFn: () => storesService.findById(storeId!),
    enabled: !!storeId,
    retry: false, // Não tentar novamente se a loja não for encontrada (404)
  });

  const isEditing = !!storeId;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      description: "",
      slug: "",
      cnpjcpf: "",
      whatsapp: "",
      instagramUrl: "",
      facebookUrl: "",
      logoUrl: "",
      bannerUrl: "",
      cityId: "",
      primaryColor: "#000000",
      secondaryColor: "#FFFFFF",
      tertiaryColor: "#808080",
    },
  });

  // Atualizar valores do formulário quando storeData for carregado
  useEffect(() => {
    if (storeData && isEditing) {
      reset({
        name: storeData.name,
        description: storeData.description || "",
        slug: storeData.slug,
        cnpjcpf: storeData.cnpjcpf || "",
        whatsapp: storeData.whatsapp || "",
        instagramUrl: storeData.instagramUrl || "",
        facebookUrl: storeData.facebookUrl || "",
        logoUrl: storeData.logoUrl || "",
        bannerUrl: storeData.bannerUrl || "",
        cityId: storeData.cityId,
        primaryColor: storeData.theme?.primaryColor || "#000000",
        secondaryColor: storeData.theme?.secondaryColor || "#FFFFFF",
        tertiaryColor: storeData.theme?.tertiaryColor || "#808080",
      });
    }
  }, [storeData, isEditing, reset]);

  const watchedName = watch("name");

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!isEditing && name) {
      const generatedSlug = createSlug(name);
      setValue("slug", generatedSlug);
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: StoreFormData) => {
      const { primaryColor, secondaryColor, tertiaryColor, ...storeData } = data;
      return storesService.create({
        ...storeData,
        theme: {
          primaryColor,
          secondaryColor,
          tertiaryColor,
        },
      });
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas a lojas
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["stores", "user"] }); // Invalidar query de lojas do usuário
      showSuccess("Loja criada com sucesso!");
      router.push("/loja");
    },
    onError: (error: Error) => {
      showError(error.message || "Erro ao criar loja");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: StoreFormData) => {
      const { primaryColor, secondaryColor, tertiaryColor, ...storeData } = data;
      
      // Campos opcionais que podem ser strings vazias - serão convertidos para undefined pelo backend
      // O backend aceita strings vazias e as transforma em undefined automaticamente
      const updateData: Record<string, any> = {
        ...storeData,
        theme: {
          primaryColor,
          secondaryColor,
          tertiaryColor,
        },
      };
      
      return storesService.update(storeId!, updateData);
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas a lojas
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["store", storeId] });
      queryClient.invalidateQueries({ queryKey: ["stores", "user"] }); // Invalidar query de lojas do usuário
      showSuccess("Loja atualizada com sucesso!");
      router.push("/loja");
    },
    onError: (error: any) => {
      // Melhorar tratamento de erros da API
      let errorMessage = "Erro ao atualizar loja";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.status === 400 && error?.data?.issues) {
        // Erros de validação do Zod
        const validationErrors = error.data.issues.map((issue: any) => issue.message).join(", ");
        errorMessage = `Erro de validação: ${validationErrors}`;
      } else if (error?.status === 401) {
        errorMessage = "Você precisa estar logado para atualizar a loja";
      } else if (error?.status === 404) {
        errorMessage = "Loja não encontrada";
      } else if (error?.status === 409) {
        errorMessage = error?.data?.message || "Os dados informados já estão em uso por outra loja";
      }
      
      showError(errorMessage);
    },
  });

  const onSubmit = (data: StoreFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoadingStore || isLoadingCities) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">
          {isEditing ? "Editar Loja" : "Criar Loja"}
        </h1>
        <p className="text-muted-foreground">
          {isEditing 
            ? "Atualize as informações da sua loja" 
            : "Configure sua loja para começar a vender"}
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            {/* Layout em 2 colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coluna Esquerda - Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Informações Básicas</h3>
                
                <Field>
                  <div className="flex items-center gap-2 mb-1.5">
                    <FieldLabel htmlFor="name">Nome da Loja *</FieldLabel>
                  </div>
                  <div className="relative">
                    <Input
                      id="name"
                      {...register("name")}
                      onChange={(e) => {
                        register("name").onChange(e);
                        handleNameChange(e);
                      }}
                      aria-invalid={errors.name ? "true" : "false"}
                      maxLength={120}
                    />
                    {watch("name") && !errors.name && watch("name").length > 0 && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600 dark:text-green-400 pointer-events-none" />
                    )}
                    {errors.name && (
                      <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive pointer-events-none" />
                    )}
                  </div>
                  {watch("name") && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {watch("name").length}/120 caracteres
                    </p>
                  )}
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <div className="flex items-center gap-2 mb-1.5">
                    <FieldLabel htmlFor="slug">Slug *</FieldLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                          <HelpCircle className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">O slug será usado na URL da sua loja</p>
                        <p className="text-xs mt-1">Exemplo: minha-loja</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <Input
                      id="slug"
                      {...register("slug")}
                      aria-invalid={errors.slug ? "true" : "false"}
                      maxLength={120}
                    />
                    {watch("slug") && !errors.slug && watch("slug").length > 0 && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600 dark:text-green-400 pointer-events-none" />
                    )}
                    {errors.slug && (
                      <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive pointer-events-none" />
                    )}
                  </div>
                  <FieldDescription>
                    URL amigável da loja. Será gerado automaticamente a partir do nome.
                  </FieldDescription>
                  {watch("slug") && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {watch("slug").length}/120 caracteres
                    </p>
                  )}
                  {errors.slug && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.slug.message}
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
                  <div className="flex items-center gap-2 mb-1.5">
                    <FieldLabel htmlFor="cnpjcpf">CNPJ/CPF *</FieldLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                          <HelpCircle className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Digite apenas números, sem pontos ou traços</p>
                        <p className="text-xs mt-1">CPF: 11 dígitos | CNPJ: 14 dígitos</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <Input
                      id="cnpjcpf"
                      {...register("cnpjcpf")}
                      placeholder="00000000000000"
                      aria-invalid={errors.cnpjcpf ? "true" : "false"}
                      maxLength={14}
                    />
                    {watch("cnpjcpf") && !errors.cnpjcpf && watch("cnpjcpf").length >= 11 && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600 dark:text-green-400 pointer-events-none" />
                    )}
                    {errors.cnpjcpf && (
                      <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive pointer-events-none" />
                    )}
                  </div>
                  {errors.cnpjcpf && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.cnpjcpf.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="cityId">Cidade *</FieldLabel>
                  <select
                    id="cityId"
                    {...register("cityId")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))' }}
                    aria-invalid={errors.cityId ? "true" : "false"}
                  >
                    <option value="">Selecione uma cidade</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name} - {city.state}
                      </option>
                    ))}
                  </select>
                  {errors.cityId && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.cityId.message}
                    </p>
                  )}
                </Field>
              </div>

              {/* Coluna Direita - Contato e Visual */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b">Contato e Visual</h3>

                <Field>
                  <FieldLabel htmlFor="whatsapp">WhatsApp *</FieldLabel>
                  <Input
                    id="whatsapp"
                    {...register("whatsapp")}
                    placeholder="5511999999999"
                    aria-invalid={errors.whatsapp ? "true" : "false"}
                  />
                  {errors.whatsapp && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.whatsapp.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="instagramUrl">URL do Instagram</FieldLabel>
                  <Input
                    id="instagramUrl"
                    type="url"
                    {...register("instagramUrl")}
                    placeholder="https://instagram.com/loja"
                    aria-invalid={errors.instagramUrl ? "true" : "false"}
                  />
                  {errors.instagramUrl && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.instagramUrl.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="facebookUrl">URL do Facebook</FieldLabel>
                  <Input
                    id="facebookUrl"
                    type="url"
                    {...register("facebookUrl")}
                    placeholder="https://facebook.com/loja"
                    aria-invalid={errors.facebookUrl ? "true" : "false"}
                  />
                  {errors.facebookUrl && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.facebookUrl.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="logoUrl">URL do Logo</FieldLabel>
                  <Input
                    id="logoUrl"
                    type="url"
                    {...register("logoUrl")}
                    placeholder="https://exemplo.com/logo.png"
                    aria-invalid={errors.logoUrl ? "true" : "false"}
                  />
                  {errors.logoUrl && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.logoUrl.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="bannerUrl">URL do Banner</FieldLabel>
                  <Input
                    id="bannerUrl"
                    type="url"
                    {...register("bannerUrl")}
                    placeholder="https://exemplo.com/banner.png"
                    aria-invalid={errors.bannerUrl ? "true" : "false"}
                  />
                  {errors.bannerUrl && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.bannerUrl.message}
                    </p>
                  )}
                </Field>
              </div>
            </div>

            {/* Cores do Tema - Largura total */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-4">Cores do Tema</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field>
                  <FieldLabel htmlFor="primaryColor">Cor Primária *</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      {...register("primaryColor")}
                      className="w-20 h-10"
                      aria-invalid={errors.primaryColor ? "true" : "false"}
                    />
                    <Input
                      {...register("primaryColor")}
                      placeholder="#000000"
                      aria-invalid={errors.primaryColor ? "true" : "false"}
                    />
                  </div>
                  {errors.primaryColor && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.primaryColor.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="secondaryColor">Cor Secundária *</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      {...register("secondaryColor")}
                      className="w-20 h-10"
                      aria-invalid={errors.secondaryColor ? "true" : "false"}
                    />
                    <Input
                      {...register("secondaryColor")}
                      placeholder="#FFFFFF"
                      aria-invalid={errors.secondaryColor ? "true" : "false"}
                    />
                  </div>
                  {errors.secondaryColor && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.secondaryColor.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="tertiaryColor">Cor Terciária *</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      id="tertiaryColor"
                      type="color"
                      {...register("tertiaryColor")}
                      className="w-20 h-10"
                      aria-invalid={errors.tertiaryColor ? "true" : "false"}
                    />
                    <Input
                      {...register("tertiaryColor")}
                      placeholder="#808080"
                      aria-invalid={errors.tertiaryColor ? "true" : "false"}
                    />
                  </div>
                  {errors.tertiaryColor && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.tertiaryColor.message}
                    </p>
                  )}
                </Field>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                    <span>{isEditing ? "Salvando..." : "Criando..."}</span>
                  </>
                ) : (
                  isEditing ? "Salvar Alterações" : "Criar Loja"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/loja")}
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

