"use client";

import { useState, useEffect, useMemo, useRef, useImperativeHandle, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { citiesService } from "@/services/cities-service";
import { addressesService } from "@/services/addresses-service";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";
import { showSuccess, showError } from "@/lib/toast";
import { BRAZIL_STATES } from "@/lib/brasil-states";

const addressSchema = z.object({
  street: z.string().min(1, "Rua é obrigatória").max(255, "Rua deve ter no máximo 255 caracteres"),
  number: z.string().min(1, "Número é obrigatório").max(10, "Número deve ter no máximo 10 caracteres"),
  complement: z.string().max(255, "Complemento deve ter no máximo 255 caracteres").optional().or(z.literal("")),
  neighborhood: z.string().min(1, "Bairro é obrigatório").max(100, "Bairro deve ter no máximo 100 caracteres"),
  cityId: z.string().uuid("Cidade é obrigatória"),
  zipCode: z.string().length(8, "CEP deve ter 8 caracteres").regex(/^\d+$/, "CEP deve conter apenas números"),
  country: z.string().min(1, "País é obrigatório").max(50, "País deve ter no máximo 50 caracteres"),
});

type AddressFormData = z.infer<typeof addressSchema>;

export interface AddressSectionRef {
  saveAddress: () => Promise<void>;
}

export const AddressSection = forwardRef<AddressSectionRef, { storeId: string }>(
  ({ storeId }, ref) => {
  const queryClient = useQueryClient();
  const [addressState, setAddressState] = useState("");
  const [citySearchTerm, setCitySearchTerm] = useState("");
  const addressIdRef = useRef<string | null>(null);

  // Buscar endereço da loja PRIMEIRO
  const { data: storeAddress, isLoading: isLoadingAddress } = useQuery({
    queryKey: ["addresses", storeId],
    queryFn: async () => {
      const response = await addressesService.findAll({ limit: 100 });
      const storeAddresses = response.addresses.filter(addr => addr.storeId === storeId);
      return storeAddresses.find(addr => addr.isMain) || storeAddresses[0] || null;
    },
  });

  // Buscar cidade para obter o estado quando há endereço existente
  // Buscar todas as cidades e filtrar pelo ID (limitado a 100 pelo backend)
  const { data: cityForAddress, isLoading: isLoadingCity } = useQuery({
    queryKey: ["city-for-address", storeAddress?.cityId],
    queryFn: async () => {
      if (!storeAddress?.cityId) return null;
      try {
        // Buscar cidades com limite máximo de 100 (limite do backend)
        const response = await citiesService.findAll({ limit: 100, page: 1 });
        const city = response.cities.find(c => c.id === storeAddress.cityId);
        
        // Se não encontrou na primeira página, tentar buscar em outras páginas
        if (!city && response.meta.totalPages > 1) {
          for (let page = 2; page <= response.meta.totalPages; page++) {
            const pageResponse = await citiesService.findAll({ limit: 100, page });
            const foundCity = pageResponse.cities.find(c => c.id === storeAddress.cityId);
            if (foundCity) return foundCity;
          }
        }
        
        return city || null;
      } catch (error) {
        console.error("Erro ao buscar cidade para endereço:", error);
        return null;
      }
    },
    enabled: !!storeAddress?.cityId,
  });

  // Buscar cidades do estado selecionado
  const { data: citiesData, isLoading: isLoadingCities, error: citiesError } = useQuery({
    queryKey: ["cities", addressState],
    queryFn: async () => {
      if (!addressState) {
        return { cities: [], meta: { totalItems: 0, totalPages: 0, currentPage: 1, perPage: 100 } };
      }
      try {
        // O limite máximo da API é 100, então vamos buscar todas as páginas se necessário
        const result = await citiesService.findAll({ state: addressState, limit: 100, page: 1 });
        
        console.log(`Cidades encontradas para ${addressState}:`, {
          primeiraPagina: result.cities.length,
          totalItems: result.meta.totalItems,
          totalPages: result.meta.totalPages,
        });
        
        // Se houver mais páginas, buscar todas
        if (result.meta.totalPages > 1) {
          const allCities = [...result.cities];
          for (let page = 2; page <= result.meta.totalPages; page++) {
            const pageResult = await citiesService.findAll({ 
              state: addressState, 
              limit: 100, 
              page 
            });
            allCities.push(...pageResult.cities);
          }
          console.log(`Total de cidades carregadas para ${addressState}:`, allCities.length);
          return {
            cities: allCities,
            meta: {
              ...result.meta,
              totalItems: allCities.length,
            },
          };
        }
        
        console.log(`Total de cidades carregadas para ${addressState}:`, result.cities.length);
        return result;
      } catch (error) {
        console.error("Erro ao buscar cidades:", error);
        throw error;
      }
    },
    enabled: !!addressState,
    staleTime: 1000 * 60 * 60,
    retry: 2,
    refetchOnMount: true,
  });

  const cities = citiesData?.cities || [];

  // Filtrar cidades por termo de busca
  const filteredCities = useMemo(() => {
    const sorted = [...cities].sort((a, b) => a.name.localeCompare(b.name));
    
    if (citySearchTerm.trim()) {
      const searchLower = citySearchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return sorted.filter(city => {
        const cityName = city.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return cityName.includes(searchLower);
      });
    }
    
    return sorted;
  }, [cities, citySearchTerm]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger,
    getValues,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      cityId: "",
      zipCode: "",
      country: "Brasil",
    },
  });

  // Inicializar o formulário quando o endereço e cidade forem carregados
  // Usa addressIdRef para rastrear se já foi inicializado para este endereço específico
  useEffect(() => {
    if (storeAddress && cityForAddress && addressIdRef.current !== storeAddress.id) {
      addressIdRef.current = storeAddress.id;
      // Garantir que o estado seja setado antes de resetar o formulário
      setAddressState(cityForAddress.state);
      reset({
        street: storeAddress.street,
        number: storeAddress.number,
        complement: storeAddress.complement || "",
        neighborhood: storeAddress.neighborhood,
        cityId: storeAddress.cityId,
        zipCode: storeAddress.zipCode,
        country: storeAddress.country,
      });
    }
  }, [storeAddress, cityForAddress, reset]);

  // Garantir que quando o estado mudar manualmente, o cityId seja limpo
  useEffect(() => {
    if (addressState) {
      // Limpar o cityId quando o estado mudar
      const currentCityId = watch("cityId");
      if (currentCityId) {
        // Verificar se a cidade atual pertence ao novo estado
        const currentCity = cities.find(c => c.id === currentCityId);
        if (!currentCity || currentCity.state !== addressState) {
          setValue("cityId", "");
        }
      }
    }
  }, [addressState, cities, watch, setValue]);

  const createAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      const payload: any = {
        street: data.street,
        number: data.number,
        neighborhood: data.neighborhood,
        cityId: data.cityId,
        zipCode: data.zipCode,
        country: data.country,
        storeId: storeId,
        isMain: true,
      };
      // Enviar complemento apenas se tiver valor, senão omitir (o backend trata como opcional)
      if (data.complement && data.complement.trim()) {
        payload.complement = data.complement.trim();
      }
      
      console.log("📤 Criando endereço com payload:", JSON.stringify(payload, null, 2));
      try {
        const result = await addressesService.create(payload);
        console.log("✅ Endereço criado com sucesso no service:", result);
        return result;
      } catch (error: any) {
        console.error("❌ Erro no service ao criar endereço:", error);
        console.error("❌ Detalhes do erro:", {
          message: error?.message,
          status: error?.status,
          data: error?.data,
          response: error?.response,
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      showSuccess("Endereço criado com sucesso!");
    },
    onError: (error: Error) => {
      showError(error.message || "Erro ao criar endereço");
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      if (!storeAddress?.id) throw new Error("Endereço não encontrado");
      const payload: any = {
        street: data.street,
        number: data.number,
        neighborhood: data.neighborhood,
        cityId: data.cityId,
        zipCode: data.zipCode,
        country: data.country,
      };
      // Enviar complemento apenas se tiver valor, senão null para limpar
      if (data.complement && data.complement.trim()) {
        payload.complement = data.complement.trim();
      } else {
        payload.complement = null; // Para limpar o campo se estiver vazio
      }
      
      console.log("📤 Atualizando endereço com payload:", JSON.stringify(payload, null, 2));
      try {
        const result = await addressesService.update(storeAddress.id, payload);
        console.log("✅ Endereço atualizado com sucesso no service:", result);
        return result;
      } catch (error: any) {
        console.error("❌ Erro no service ao atualizar endereço:", error);
        console.error("❌ Detalhes do erro:", {
          message: error?.message,
          status: error?.status,
          data: error?.data,
          response: error?.response,
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      showSuccess("Endereço atualizado com sucesso!");
    },
    onError: (error: Error) => {
      showError(error.message || "Erro ao atualizar endereço");
    },
  });

  const onSubmit = (data: AddressFormData) => {
    if (storeAddress) {
      updateAddressMutation.mutate(data);
    } else {
      createAddressMutation.mutate(data);
    }
  };

  // Expor função para salvar endereço externamente
  useImperativeHandle(ref, () => ({
    saveAddress: async () => {
      const data = getValues();
      console.log("📦 Dados do endereço coletados:", data);
      
      // Verificar se há dados preenchidos (pelo menos um campo obrigatório)
      const hasData = data.street && data.number && data.neighborhood && data.cityId && data.zipCode && data.country;
      
      if (!hasData) {
        console.log("⚠️ Endereço não tem dados suficientes, pulando salvamento");
        // Se não houver dados, não fazer nada (endereço é opcional ao salvar a loja)
        return;
      }
      
      console.log("✅ Endereço tem dados, validando...");
      
      // Validar todos os campos se houver dados
      const isValid = await trigger();
      if (!isValid) {
        console.error("❌ Validação do endereço falhou");
        throw new Error("Por favor, preencha todos os campos obrigatórios do endereço");
      }
      
      console.log("✅ Validação passou, salvando endereço...", { 
        isUpdate: !!storeAddress,
        addressId: storeAddress?.id 
      });
      
      // Retornar promise que resolve quando a mutation for bem-sucedida
      return new Promise<void>((resolve, reject) => {
        if (storeAddress) {
          console.log("🔄 Atualizando endereço existente...");
          updateAddressMutation.mutate(data, {
            onSuccess: () => {
              console.log("✅ Endereço atualizado com sucesso");
              resolve();
            },
            onError: (error) => {
              console.error("❌ Erro ao atualizar endereço:", error);
              reject(error);
            },
          });
        } else {
          console.log("➕ Criando novo endereço...");
          createAddressMutation.mutate(data, {
            onSuccess: () => {
              console.log("✅ Endereço criado com sucesso");
              resolve();
            },
            onError: (error) => {
              console.error("❌ Erro ao criar endereço:", error);
              reject(error);
            },
          });
        }
      });
    },
  }), [storeAddress, trigger, getValues, updateAddressMutation, createAddressMutation]);

  // Formatar CEP
  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
    setValue("zipCode", value);
  };

  // Mostrar loading enquanto carrega endereço ou cidade (quando há endereço existente)
  const isInitializing = isLoadingAddress || (storeAddress?.cityId && isLoadingCity);
  
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field>
          <FieldLabel htmlFor="zipCode">CEP *</FieldLabel>
          <Input
            id="zipCode"
            {...register("zipCode")}
            onChange={handleZipCodeChange}
            placeholder="00000000"
            maxLength={8}
            aria-invalid={errors.zipCode ? "true" : "false"}
          />
          {errors.zipCode && (
            <p className="text-sm text-destructive mt-1">
              {errors.zipCode.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="country">País *</FieldLabel>
          <Input
            id="country"
            {...register("country")}
            aria-invalid={errors.country ? "true" : "false"}
          />
          {errors.country && (
            <p className="text-sm text-destructive mt-1">
              {errors.country.message}
            </p>
          )}
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="street">Rua *</FieldLabel>
        <Input
          id="street"
          {...register("street")}
          placeholder="Nome da rua"
          aria-invalid={errors.street ? "true" : "false"}
        />
        {errors.street && (
          <p className="text-sm text-destructive mt-1">
            {errors.street.message}
          </p>
        )}
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Field>
          <FieldLabel htmlFor="number">Número *</FieldLabel>
          <Input
            id="number"
            {...register("number")}
            placeholder="123"
            aria-invalid={errors.number ? "true" : "false"}
          />
          {errors.number && (
            <p className="text-sm text-destructive mt-1">
              {errors.number.message}
            </p>
          )}
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel htmlFor="complement">Complemento</FieldLabel>
          <Input
            id="complement"
            {...register("complement")}
            placeholder="Apartamento, bloco, etc. (opcional)"
            aria-invalid={errors.complement ? "true" : "false"}
          />
          {errors.complement && (
            <p className="text-sm text-destructive mt-1">
              {errors.complement.message}
            </p>
          )}
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="neighborhood">Bairro *</FieldLabel>
        <Input
          id="neighborhood"
          {...register("neighborhood")}
          placeholder="Nome do bairro"
          aria-invalid={errors.neighborhood ? "true" : "false"}
        />
        {errors.neighborhood && (
          <p className="text-sm text-destructive mt-1">
            {errors.neighborhood.message}
          </p>
        )}
      </Field>

      <div className="space-y-4">
        <Field>
          <FieldLabel htmlFor="state">Estado *</FieldLabel>
          <Select 
            value={addressState} 
            onValueChange={(value) => {
              setAddressState(value);
              setCitySearchTerm("");
              setValue("cityId", "");
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              {BRAZIL_STATES.map((state) => (
                <SelectItem key={state.code} value={state.code}>
                  {state.name} ({state.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!addressState && (
            <p className="text-sm text-destructive mt-1">
              Selecione um estado
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="cityId">Cidade *</FieldLabel>
          <div className="space-y-2">
            {addressState && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar cidade..."
                  value={citySearchTerm}
                  onChange={(e) => setCitySearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}
            <Select
              value={watch("cityId")}
              onValueChange={(value) => setValue("cityId", value)}
              disabled={!addressState}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !addressState 
                    ? "Selecione o estado primeiro"
                    : isLoadingCities 
                    ? "Carregando cidades..." 
                    : "Selecione a cidade"
                } />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCities ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground">Carregando cidades...</span>
                  </div>
                ) : citiesError ? (
                  <div className="px-2 py-4 text-sm text-destructive text-center">
                    Erro ao carregar cidades. Tente novamente.
                  </div>
                ) : filteredCities.length === 0 ? (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    {citySearchTerm 
                      ? "Nenhuma cidade encontrada com esse termo" 
                      : cities.length === 0
                      ? "Nenhuma cidade disponível para este estado"
                      : "Nenhuma cidade encontrada"}
                  </div>
                ) : (
                  filteredCities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          {errors.cityId && (
            <p className="text-sm text-destructive mt-1">
              {errors.cityId.message}
            </p>
          )}
          {filteredCities.length > 0 && citySearchTerm && (
            <p className="text-xs text-muted-foreground mt-1">
              {filteredCities.length} {filteredCities.length === 1 ? "cidade encontrada" : "cidades encontradas"}
            </p>
          )}
        </Field>
      </div>
    </div>
  );
});

AddressSection.displayName = "AddressSection";

