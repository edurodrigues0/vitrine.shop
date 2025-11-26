"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { storesService } from "@/services/stores-service";
import { citiesService } from "@/services/cities-service";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { StoreImageUpload } from "@/components/store-image-upload";
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
<<<<<<< HEAD
import { Loader2, CheckCircle2, XCircle, HelpCircle, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
=======
import { Loader2, CheckCircle2, XCircle, HelpCircle, Eye, Save, ArrowLeft, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
>>>>>>> 09be0beba2b75b9b584c84314fb1aa00bde79003

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
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugCheckTimer, setSlugCheckTimer] = useState<NodeJS.Timeout | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
    queryFn: () => storesService.findById(storeId!), // Non-null assertion as we check enabled
    enabled: !!storeId,
    retry: false, // Don't retry if store is not found (404)
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

  // Update form values when storeData is loaded
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
      // Invalidate all store-related queries
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["stores", "user"] }); // Invalidate user's stores query
      showSuccess("Loja criada com sucesso!");
      router.push("/loja");
    },
    onError: (error: Error) => {
      showError(error.message || "Erro ao criar loja");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: StoreFormData) => {
<<<<<<< HEAD
      const { primaryColor, secondaryColor, tertiaryColor, ...storeData } = data;
      
      // Optional fields that can be empty strings - will be converted to undefined by the backend
      // The backend accepts empty strings and transforms them to undefined automatically
      const updateData: Record<string, any> = {
=======
      const {
        primaryColor, primaryGradient, secondaryColor, bgColor, surfaceColor,
        textColor, textSecondaryColor, highlightColor, borderColor, hoverColor, overlayColor,
        ...storeData
      } = data;

      const updateData: any = {
>>>>>>> 09be0beba2b75b9b584c84314fb1aa00bde79003
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

      return storesService.update(storeId!, updateData);
    },
    onSuccess: () => {
<<<<<<< HEAD
      // Invalidate all store-related queries
=======
      // Set flag to prevent useEffect from resetting form with stale data
      justSavedRef.current = true;

      // Invalidar todas as queries relacionadas a lojas
>>>>>>> 09be0beba2b75b9b584c84314fb1aa00bde79003
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      queryClient.invalidateQueries({ queryKey: ["store", storeId] });
      queryClient.invalidateQueries({ queryKey: ["stores", "user"] }); // Invalidate user's stores query
      showSuccess("Loja atualizada com sucesso!");
      // Não redirecionar - manter usuário na página com as configurações salvas
    },
    onError: (error: any) => {
      // Improve API error handling
      let errorMessage = "Erro ao atualizar loja";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.status === 400 && error?.data?.issues) {
        // Zod validation errors
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

  // Function to calculate color contrast
  function getContrastColor(hexColor: string): string {
    // If color is empty or invalid, return black as default
    if (!hexColor || !/^#([0-9A-F]{3}){1,2}$/i.test(hexColor)) {
      return '#000000';
    }
    
    // Remove # from the beginning if present
    const hex = hexColor.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2), 16);
    const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4), 16);
    const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6), 16);
    
    // Relative luminance formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return black for light colors and white for dark colors
    return brightness > 128 ? '#000000' : '#FFFFFF';
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
            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Information */}
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

              {/* Right Column - Images and Colors */}
              <div className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-4">
                  <StoreImageUpload
                    storeId={storeId || ""}
                    type="logo"
                    currentImageUrl={watch("logoUrl")}
                    onUploadSuccess={(url) => {
                      setValue("logoUrl", url, { shouldValidate: true });
                    }}
                    onUploadError={(error) => {
                      showError(`Erro ao fazer upload da logo: ${error.message}`);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    A logo será exibida no cabeçalho da sua loja. Tamanho recomendado: 200x200px
                  </p>
                </div>

                {/* Banner Upload */}
                <div className="space-y-4">
                  <StoreImageUpload
                    storeId={storeId || ""}
                    type="banner"
                    currentImageUrl={watch("bannerUrl")}
                    onUploadSuccess={(url) => {
                      setValue("bannerUrl", url, { shouldValidate: true });
                    }}
                    onUploadError={(error) => {
                      showError(`Erro ao fazer upload do banner: ${error.message}`);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    O banner será exibido no topo da sua loja. Tamanho recomendado: 1200x400px
                  </p>
                </div>

                {/* Store Colors */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Cores da Loja</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field>
                      <FieldLabel htmlFor="primaryColor">Cor Primária</FieldLabel>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="primaryColor"
                          {...register("primaryColor")}
                          className="h-10 w-10 rounded cursor-pointer"
                        />
                        <Input
                          {...register("primaryColor")}
                          className="w-32 font-mono text-sm"
                          maxLength={7}
                        />
                      </div>
                      {errors.primaryColor && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.primaryColor.message}
                        </p>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="secondaryColor">Cor Secundária</FieldLabel>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="secondaryColor"
                          {...register("secondaryColor")}
                          className="h-10 w-10 rounded cursor-pointer"
                        />
                        <Input
                          {...register("secondaryColor")}
                          className="w-32 font-mono text-sm"
                          maxLength={7}
                        />
                      </div>
                      {errors.secondaryColor && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.secondaryColor.message}
                        </p>
                      )}
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="tertiaryColor">Cor Terciária</FieldLabel>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="tertiaryColor"
                          {...register("tertiaryColor")}
                          className="h-10 w-10 rounded cursor-pointer"
                        />
                        <Input
                          {...register("tertiaryColor")}
                          className="w-32 font-mono text-sm"
                          maxLength={7}
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

                {/* Color Preview */}
                <div className="mt-6 p-6 rounded-lg border" style={{ backgroundColor: watch('tertiaryColor') || '#f3f4f6' }}>
                  <div className="p-6 rounded-lg" style={{ backgroundColor: watch('secondaryColor') || '#ffffff' }}>
                    <div className="flex items-center gap-4 mb-4">
                      {watch('logoUrl') ? (
                        <img 
                          src={watch('logoUrl')} 
                          alt="Logo da Loja" 
                          className="h-16 w-16 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <h2 className="text-2xl font-bold" style={{ color: watch('primaryColor') || '#000000' }}>
                        {watch('name') || 'Nome da Loja'}
                      </h2>
                    </div>
                    
                    {watch('bannerUrl') && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img 
                          src={watch('bannerUrl')} 
                          alt="Banner da Loja" 
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}
                    
                    <p className="mb-4" style={{ color: watch('primaryColor') || '#000000' }}>
                      {watch('description') || 'Esta é uma prévia de como sua loja será exibida para os clientes.'}
                    </p>
                    
                    <div className="flex gap-3">
                      <Button 
                        style={{
                          backgroundColor: watch('primaryColor') || '#000000',
                          color: getContrastColor(watch('primaryColor') || '#000000')
                        }}
                      >
                        Botão Primário
                      </Button>
                      <Button 
                        variant="outline"
                        style={{
                          borderColor: watch('primaryColor') || '#000000',
                          color: watch('primaryColor') || '#000000'
                        }}
                      >
                        Botão Secundário
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Redes Sociais</h3>
                  
                  <Field>
                    <FieldLabel htmlFor="instagramUrl">Instagram</FieldLabel>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">@</span>
                      <Input
                        id="instagramUrl"
                        {...register("instagramUrl")}
                        placeholder="sualoja"
                        className={errors.instagramUrl ? "border-destructive" : ""}
                      />
                    </div>
                    {errors.instagramUrl && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.instagramUrl.message}
                      </p>
                    )}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="facebookUrl">Facebook</FieldLabel>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">facebook.com/</span>
                      <Input
                        id="facebookUrl"
                        {...register("facebookUrl")}
                        placeholder="sualoja"
                        className={errors.facebookUrl ? "border-destructive" : ""}
                      />
                    </div>
                    {errors.facebookUrl && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.facebookUrl.message}
                      </p>
                    )}
                  </Field>
                </div>
              </div>
            </div>

<<<<<<< HEAD
            {/* Action Buttons */}
=======
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
>>>>>>> 09be0beba2b75b9b584c84314fb1aa00bde79003
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
