"use client";

import { useForm, Controller } from "react-hook-form";
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
import { Loader2, CheckCircle2, XCircle, HelpCircle, Eye, Save, ArrowLeft, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";

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

  // Theme Colors - Complete palette
  primaryColor: z.string().min(1, "Obrigatório"),
  primaryGradient: z.string().optional(),
  secondaryColor: z.string().min(1, "Obrigatório"),
  bgColor: z.string().min(1, "Obrigatório"),
  surfaceColor: z.string().min(1, "Obrigatório"),
  textColor: z.string().min(1, "Obrigatório"),
  textSecondaryColor: z.string().min(1, "Obrigatório"),
  highlightColor: z.string().min(1, "Obrigatório"),
  borderColor: z.string().min(1, "Obrigatório"),
  hoverColor: z.string().min(1, "Obrigatório"),
  overlayColor: z.string().optional(),
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
  const [selectedState, setSelectedState] = useState("");

  const uniqueStates = useMemo(() => {
    return cities.reduce((acc: string[], city) => {
      if (!acc.includes(city.state)) {
        acc.push(city.state);
      }
      return acc;
    }, []).sort();
  }, [cities]);

  const filteredCities = useMemo(() => {
    return cities.filter(city => city.state === selectedState).sort((a, b) => a.name.localeCompare(b.name));
  }, [cities, selectedState]);

  // Get store if editing
  const { data: storeData, isLoading: isLoadingStore } = useQuery({
    queryKey: ["store", storeId],
    queryFn: () => storesService.findById(storeId!),
    enabled: !!storeId,
    retry: false, // Não tentar novamente se a loja não for encontrada (404)
  });

  const isEditing = !!storeId;
  const justSavedRef = useRef(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
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
      primaryColor: "#2563eb",
      primaryGradient: "",
      secondaryColor: "#7c3aed",
      bgColor: "#ffffff",
      surfaceColor: "#f3f4f6",
      textColor: "#1f2937",
      textSecondaryColor: "#64748b",
      highlightColor: "#f59e0b",
      borderColor: "#e2e8f0",
      hoverColor: "#dbeafe",
      overlayColor: "rgba(0,0,0,0.5)",
    },
  });

  // Atualizar valores do formulário quando storeData for carregado
  useEffect(() => {
    // Skip reset if form was just saved (to prevent overwriting with stale cache data)
    if (justSavedRef.current) {
      justSavedRef.current = false;
      return;
    }

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
        primaryColor: storeData.theme?.primary || "#2563eb",
        primaryGradient: storeData.theme?.primaryGradient || "",
        secondaryColor: storeData.theme?.secondary || "#7c3aed",
        bgColor: storeData.theme?.bg || "#ffffff",
        surfaceColor: storeData.theme?.surface || "#f3f4f6",
        textColor: storeData.theme?.text || "#1f2937",
        textSecondaryColor: storeData.theme?.textSecondary || "#64748b",
        highlightColor: storeData.theme?.highlight || "#f59e0b",
        borderColor: storeData.theme?.border || "#e2e8f0",
        hoverColor: storeData.theme?.hover || "#dbeafe",
        overlayColor: storeData.theme?.overlay || "rgba(0,0,0,0.5)",
      });

      const city = cities.find(c => c.id === storeData.cityId);
      if (city) {
        setSelectedState(city.state);
      }
    }
  }, [storeData, isEditing, reset, cities]);

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
      const {
        primaryColor, primaryGradient, secondaryColor, bgColor, surfaceColor,
        textColor, textSecondaryColor, highlightColor, borderColor, hoverColor, overlayColor,
        ...storeData
      } = data;

      return storesService.create({
        ...storeData,
        theme: {
          primary: primaryColor,
          primaryGradient,
          secondary: secondaryColor,
          bg: bgColor,
          surface: surfaceColor,
          text: textColor,
          textSecondary: textSecondaryColor,
          highlight: highlightColor,
          border: borderColor,
          hover: hoverColor,
          overlay: overlayColor,
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
      const {
        primaryColor, primaryGradient, secondaryColor, bgColor, surfaceColor,
        textColor, textSecondaryColor, highlightColor, borderColor, hoverColor, overlayColor,
        ...storeData
      } = data;

      const updateData: any = {
        ...storeData,
        theme: {
          primary: primaryColor,
          primaryGradient,
          secondary: secondaryColor,
          bg: bgColor,
          surface: surfaceColor,
          text: textColor,
          textSecondary: textSecondaryColor,
          highlight: highlightColor,
          border: borderColor,
          hover: hoverColor,
          overlay: overlayColor,
        },
      };

      console.log("🔵 Dados sendo enviados para o backend:", updateData);
      console.log("🎨 Theme sendo enviado:", updateData.theme);

      return storesService.update(storeId!, updateData);
    },
    onSuccess: () => {
      // Set flag to prevent useEffect from resetting form with stale data
      justSavedRef.current = true;

      // Invalidar todas as queries relacionadas a lojas
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["store", storeId] });
      queryClient.invalidateQueries({ queryKey: ["stores", "user"] }); // Invalidar query de lojas do usuário
      showSuccess("Loja atualizada com sucesso!");
      // Não redirecionar - manter usuário na página com as configurações salvas
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

  const handlePreview = () => {
    const data = getValues();
    const previewData = {
      ...data,
      theme: {
        primary: data.primaryColor,
        primaryGradient: data.primaryGradient,
        secondary: data.secondaryColor,
        bg: data.bgColor,
        surface: data.surfaceColor,
        text: data.textColor,
        textSecondary: data.textSecondaryColor,
        highlight: data.highlightColor,
        border: data.borderColor,
        hover: data.hoverColor,
        overlay: data.overlayColor,
      }
    };

    // Find city name for preview
    const city = cities.find(c => c.id === data.cityId);
    if (city) {
      (previewData as any).city = city;
    }

    localStorage.setItem("store_preview_data", JSON.stringify(previewData));
    window.open("/loja/preview", "_blank");
  };

  if (isLoadingStore || isLoadingCities) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" asChild className="-ml-2">
              <Link href="/loja">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? "Editar Loja" : "Criar Loja"}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isEditing
              ? "Personalize cada detalhe da sua vitrine virtual."
              : "Vamos configurar sua nova loja."}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            Pré-visualizar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="gap-2"
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditing ? "Salvar Alterações" : "Criar Loja"}
          </Button>
        </div>
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

            {/* Cores do Tema - Paleta Completa */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold mb-2">Identidade Visual</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Configure a paleta de cores completa da sua loja. Essas cores serão aplicadas automaticamente em toda a loja pública.
              </p>

              {/* Cores Principais */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Cores Principais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="primaryColor">Cor Primária *</FieldLabel>
                    <FieldDescription>Cor principal da marca, usada em botões e destaques</FieldDescription>
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
                        placeholder="#2563eb"
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
                    <FieldDescription>Cor de apoio para elementos secundários</FieldDescription>
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
                        placeholder="#7c3aed"
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
                    <FieldLabel htmlFor="highlightColor">Cor de Destaque *</FieldLabel>
                    <FieldDescription>Usada para bordas de foco e anéis de seleção</FieldDescription>
                    <div className="flex gap-2">
                      <Input
                        id="highlightColor"
                        type="color"
                        {...register("highlightColor")}
                        className="w-20 h-10"
                        aria-invalid={errors.highlightColor ? "true" : "false"}
                      />
                      <Input
                        {...register("highlightColor")}
                        placeholder="#f59e0b"
                        aria-invalid={errors.highlightColor ? "true" : "false"}
                      />
                    </div>
                    {errors.highlightColor && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.highlightColor.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="primaryGradient">Gradiente Primário (Opcional)</FieldLabel>
                    <FieldDescription>CSS válido para background-image. Se vazio, usa a cor primária</FieldDescription>
                    <Input
                      id="primaryGradient"
                      {...register("primaryGradient")}
                      placeholder="linear-gradient(to right, #...)"
                    />
                  </Field>
                </div>
              </div>

              <div className="h-px bg-border mb-6" />

              {/* Cores de Fundo e Superfície */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Fundos e Superfícies</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="bgColor">Cor de Fundo *</FieldLabel>
                    <FieldDescription>Cor de fundo principal da página</FieldDescription>
                    <div className="flex gap-2">
                      <Input
                        id="bgColor"
                        type="color"
                        {...register("bgColor")}
                        className="w-20 h-10"
                        aria-invalid={errors.bgColor ? "true" : "false"}
                      />
                      <Input
                        {...register("bgColor")}
                        placeholder="#ffffff"
                        aria-invalid={errors.bgColor ? "true" : "false"}
                      />
                    </div>
                    {errors.bgColor && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.bgColor.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="surfaceColor">Cor de Superfície *</FieldLabel>
                    <FieldDescription>Cor de fundo de cards e painéis</FieldDescription>
                    <div className="flex gap-2">
                      <Input
                        id="surfaceColor"
                        type="color"
                        {...register("surfaceColor")}
                        className="w-20 h-10"
                        aria-invalid={errors.surfaceColor ? "true" : "false"}
                      />
                      <Input
                        {...register("surfaceColor")}
                        placeholder="#f3f4f6"
                        aria-invalid={errors.surfaceColor ? "true" : "false"}
                      />
                    </div>
                    {errors.surfaceColor && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.surfaceColor.message}
                      </p>
                    )}
                  </Field>
                </div>
              </div>

              <div className="h-px bg-border mb-6" />

              {/* Cores de Texto */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Textos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="textColor">Cor de Texto Principal *</FieldLabel>
                    <FieldDescription>Cor do texto principal</FieldDescription>
                    <div className="flex gap-2">
                      <Input
                        id="textColor"
                        type="color"
                        {...register("textColor")}
                        className="w-20 h-10"
                        aria-invalid={errors.textColor ? "true" : "false"}
                      />
                      <Input
                        {...register("textColor")}
                        placeholder="#1f2937"
                        aria-invalid={errors.textColor ? "true" : "false"}
                      />
                    </div>
                    {errors.textColor && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.textColor.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="textSecondaryColor">Cor de Texto Secundário *</FieldLabel>
                    <FieldDescription>Cor para textos de apoio e descrições</FieldDescription>
                    <div className="flex gap-2">
                      <Input
                        id="textSecondaryColor"
                        type="color"
                        {...register("textSecondaryColor")}
                        className="w-20 h-10"
                        aria-invalid={errors.textSecondaryColor ? "true" : "false"}
                      />
                      <Input
                        {...register("textSecondaryColor")}
                        placeholder="#64748b"
                        aria-invalid={errors.textSecondaryColor ? "true" : "false"}
                      />
                    </div>
                    {errors.textSecondaryColor && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.textSecondaryColor.message}
                      </p>
                    )}
                  </Field>
                </div>
              </div>

              <div className="h-px bg-border mb-6" />

              {/* Cores de Interação */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Interações</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="borderColor">Cor de Borda *</FieldLabel>
                    <FieldDescription>Cor das bordas de elementos</FieldDescription>
                    <div className="flex gap-2">
                      <Input
                        id="borderColor"
                        type="color"
                        {...register("borderColor")}
                        className="w-20 h-10"
                        aria-invalid={errors.borderColor ? "true" : "false"}
                      />
                      <Input
                        {...register("borderColor")}
                        placeholder="#e2e8f0"
                        aria-invalid={errors.borderColor ? "true" : "false"}
                      />
                    </div>
                    {errors.borderColor && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.borderColor.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="hoverColor">Cor de Hover *</FieldLabel>
                    <FieldDescription>Cor de fundo ao passar o mouse</FieldDescription>
                    <div className="flex gap-2">
                      <Input
                        id="hoverColor"
                        type="color"
                        {...register("hoverColor")}
                        className="w-20 h-10"
                        aria-invalid={errors.hoverColor ? "true" : "false"}
                      />
                      <Input
                        {...register("hoverColor")}
                        placeholder="#dbeafe"
                        aria-invalid={errors.hoverColor ? "true" : "false"}
                      />
                    </div>
                    {errors.hoverColor && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.hoverColor.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="overlayColor">Cor de Overlay (Opcional)</FieldLabel>
                    <FieldDescription>Cor de sobreposição para modais e popups</FieldDescription>
                    <Input
                      id="overlayColor"
                      {...register("overlayColor")}
                      placeholder="rgba(0,0,0,0.5)"
                    />
                  </Field>
                </div>
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

