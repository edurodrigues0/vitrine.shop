"use client";

import { useState, useEffect, useMemo, useRef, useImperativeHandle, forwardRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { citiesService } from "@/services/cities-service";
import { addressesService } from "@/services/addresses-service";
import { ibgeService, type IBGECity } from "@/services/ibge-service";
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
  cityId: z.string()
    .refine((val) => {
      // Se estiver vazio, permitir (validação de obrigatoriedade será feita no saveAddress)
      if (!val || val === "") return true;
      // Se tiver valor, deve ser um UUID válido
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89abAB][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
    }, {
      message: "Cidade inválida"
    }),
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
  const [selectedIBGECityId, setSelectedIBGECityId] = useState<number | null>(null); // ID do IBGE da cidade selecionada
  const [isLoadingCityUuid, setIsLoadingCityUuid] = useState(false);
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
  const { data: cityForAddress, isLoading: isLoadingCity } = useQuery({
    queryKey: ["city-for-address", storeAddress?.cityId],
    queryFn: async () => {
      if (!storeAddress?.cityId) return null;
      try {
        console.log("🔍 Buscando cidade por ID:", storeAddress.cityId);
        const city = await citiesService.findById(storeAddress.cityId);
        console.log("✅ Cidade encontrada:", city?.name, city?.state);
        return city;
      } catch (error: any) {
        console.error("❌ Erro ao buscar cidade por ID:", error);
        // Se não encontrou, retornar null (a cidade pode ter sido removida ou não existe mais)
        if (error?.status === 404) {
          console.warn(`⚠️ Cidade com ID ${storeAddress.cityId} não encontrada no banco`);
        }
        return null;
      }
    },
    enabled: !!storeAddress?.cityId,
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
  });

  // Buscar cidades do estado selecionado usando API do IBGE
  const { data: ibgeCities, isLoading: isLoadingCities, error: citiesError } = useQuery({
    queryKey: ["ibge-cities", addressState],
    queryFn: async () => {
      if (!addressState) {
        return [];
      }
      try {
        console.log(`📡 Buscando municípios do IBGE para o estado ${addressState}...`);
        const cities = await ibgeService.getMunicipiosByEstado(addressState);
        console.log(`✅ ${cities.length} municípios encontrados no IBGE para ${addressState}`);
        return cities;
      } catch (error) {
        console.error("❌ Erro ao buscar municípios do IBGE:", error);
        throw error;
      }
    },
    enabled: !!addressState,
    staleTime: 1000 * 60 * 60 * 24, // Cache por 24 horas (dados do IBGE mudam raramente)
    retry: 2,
    refetchOnMount: true,
  });

  const ibgeCitiesList = ibgeCities || [];

  // Estado para armazenar o mapeamento entre cidades do IBGE e UUIDs do banco
  const [cityUuidMap, setCityUuidMap] = useState<Map<string, string>>(new Map()); // key: "nome-estado", value: uuid

  // Filtrar cidades do IBGE por termo de busca
  const filteredCities = useMemo(() => {
    const sorted = [...ibgeCitiesList].sort((a, b) => a.name.localeCompare(b.name));
    
    if (citySearchTerm.trim()) {
      const searchLower = citySearchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return sorted.filter(city => {
        const cityName = city.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return cityName.includes(searchLower);
      });
    }
    
    return sorted;
  }, [ibgeCitiesList, citySearchTerm]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger,
    getValues,
    clearErrors,
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
      console.log("📝 Inicializando formulário com endereço e cidade:", {
        addressId: storeAddress.id,
        cityName: cityForAddress.name,
        cityState: cityForAddress.state,
        cityId: storeAddress.cityId,
      });
      
      // IMPORTANTE: Setar o estado PRIMEIRO e de forma síncrona
      // Isso vai disparar o carregamento das cidades do IBGE
      if (cityForAddress.state) {
        console.log("✅ Definindo estado:", cityForAddress.state);
        setAddressState(cityForAddress.state);
      }
      
      reset({
        street: storeAddress.street,
        number: storeAddress.number,
        complement: storeAddress.complement || "",
        neighborhood: storeAddress.neighborhood,
        cityId: storeAddress.cityId,
        zipCode: storeAddress.zipCode,
        country: storeAddress.country,
      });
      
      console.log("✅ Formulário inicializado completamente com estado:", cityForAddress.state);
    }
  }, [storeAddress, cityForAddress, reset]);

  // Garantir que o estado seja sempre definido quando a cidade for carregada
  // Este useEffect tem prioridade para garantir que o estado seja sempre setado
  useEffect(() => {
    if (cityForAddress?.state) {
      // Sempre definir o estado quando a cidade for carregada
      // Isso garante que após recarregar a página, o estado seja restaurado
      console.log("🔄 Garantindo que o estado está definido:", {
        cidadeState: cityForAddress.state,
        currentState: addressState,
        willSet: addressState !== cityForAddress.state,
      });
      
      // Usar uma função para garantir que o estado seja sempre atualizado
      setAddressState((current) => {
        if (current !== cityForAddress.state) {
          console.log("✅ Estado atualizado de", current, "para", cityForAddress.state);
          return cityForAddress.state;
        }
        return current;
      });
    }
  }, [cityForAddress?.state]);

  // Mapear cidade existente ao ID do IBGE quando endereço e cidades do IBGE forem carregados
  useEffect(() => {
    if (cityForAddress && ibgeCitiesList.length > 0 && storeAddress && addressState === cityForAddress.state) {
      // Buscar cidade do IBGE correspondente pelo nome e estado
      const matchingIBGECity = ibgeCitiesList.find(
        c => c.name === cityForAddress.name && c.state === cityForAddress.state
      );
      
      if (matchingIBGECity) {
        console.log("🗺️ Cidade existente mapeada para ID do IBGE:", {
          ibgeId: matchingIBGECity.id,
          cityName: cityForAddress.name,
          cityState: cityForAddress.state,
          cityUuid: cityForAddress.id,
        });
        setSelectedIBGECityId(matchingIBGECity.id);
        setCityUuidMap(prev => new Map(prev.set(`${cityForAddress.name}-${cityForAddress.state}`, cityForAddress.id)));
      } else {
        console.warn("⚠️ Cidade não encontrada na lista do IBGE:", {
          cityName: cityForAddress.name,
          cityState: cityForAddress.state,
          ibgeCitiesCount: ibgeCitiesList.length,
        });
      }
    }
  }, [cityForAddress, ibgeCitiesList, storeAddress, addressState]);

  // Garantir que quando o estado mudar manualmente, o cityId seja limpo
  // Mas NÃO limpar quando estiver inicializando com um endereço existente
  const previousStateRef = useRef<string>("");
  
  useEffect(() => {
    // Só limpar se:
    // 1. Há um estado definido
    // 2. O estado realmente mudou (não é apenas a inicialização)
    // 3. NÃO há endereço existente sendo editado com esse mesmo estado
    // 4. O estado anterior era diferente do atual
    
    if (addressState && addressState !== previousStateRef.current) {
      const isStateFromExistingAddress = storeAddress && cityForAddress?.state === addressState;
      
      if (!isStateFromExistingAddress && previousStateRef.current !== "") {
        // Estado mudou manualmente pelo usuário, não é inicialização
        console.log("🔄 Estado mudou manualmente, limpando seleção de cidade");
        setValue("cityId", "", { shouldValidate: false });
        clearErrors("cityId");
        setSelectedIBGECityId(null);
        setCitySearchTerm("");
      }
      
      previousStateRef.current = addressState;
    }
  }, [addressState, setValue, clearErrors, storeAddress, cityForAddress?.state]);

  const createAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      // Validar cityId antes de criar payload
      if (!data.cityId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.cityId)) {
        console.error("❌ cityId inválido no createAddressMutation:", data.cityId);
        throw new Error("ID da cidade inválido. Por favor, selecione uma cidade.");
      }

      const payload: any = {
        street: data.street,
        number: data.number,
        neighborhood: data.neighborhood,
        cityId: data.cityId, // Garantir que cityId está presente
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
      console.log("🔍 Validação do payload:", {
        hasCityId: !!payload.cityId,
        cityIdType: typeof payload.cityId,
        cityIdValue: payload.cityId,
        isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.cityId),
      });
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
    onSuccess: (address) => {
      console.log("✅ Endereço criado - invalidando queries:", address);
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["addresses", storeId] });
      queryClient.invalidateQueries({ queryKey: ["city-for-address", address.cityId] });
      showSuccess("Endereço criado com sucesso!");
    },
    onError: (error: Error) => {
      showError(error.message || "Erro ao criar endereço");
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      if (!storeAddress?.id) throw new Error("Endereço não encontrado");
      
      // Validar cityId antes de criar payload
      if (!data.cityId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.cityId)) {
        console.error("❌ cityId inválido no updateAddressMutation:", data.cityId);
        throw new Error("ID da cidade inválido. Por favor, selecione uma cidade.");
      }

      const payload: any = {
        street: data.street,
        number: data.number,
        neighborhood: data.neighborhood,
        cityId: data.cityId, // Garantir que cityId está presente
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
      console.log("🔍 Validação do payload:", {
        hasCityId: !!payload.cityId,
        cityIdType: typeof payload.cityId,
        cityIdValue: payload.cityId,
        isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.cityId),
      });
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
    onSuccess: (address) => {
      console.log("✅ Endereço atualizado - invalidando queries:", address);
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["addresses", storeId] });
      queryClient.invalidateQueries({ queryKey: ["city-for-address", address.cityId] });
      showSuccess("Endereço atualizado com sucesso!");
    },
    onError: (error: any) => {
      console.error("❌ Erro ao atualizar endereço:", error);
      
      // Tratamento específico para erros de conexão
      if (error?.message?.includes("conexão") || error?.message?.includes("Failed to fetch") || error instanceof TypeError) {
        showError("Erro de conexão com a API. Verifique se o servidor está rodando e tente novamente.");
      } else if (error?.status === 404) {
        showError("Endereço não encontrado. Por favor, recarregue a página.");
      } else if (error?.status === 400) {
        showError(error?.data?.message || "Dados inválidos. Verifique os campos preenchidos.");
      } else {
        showError(error?.message || "Erro ao atualizar endereço. Tente novamente.");
      }
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
      console.log("📦 Dados do endereço coletados do formulário:", {
        ...data,
        cityId: data.cityId,
        hasCityId: !!data.cityId,
        cityIdLength: data.cityId?.length,
      });
      console.log("📍 Estado selecionado:", addressState);
      console.log("🏙️ Cidades disponíveis:", filteredCities.length);
      
      // Verificar se há dados preenchidos (pelo menos um campo obrigatório)
      const hasData = data.street && data.number && data.neighborhood && data.cityId && data.zipCode && data.country;
      
      if (!hasData) {
        console.log("⚠️ Endereço não tem dados suficientes, pulando salvamento", {
          street: !!data.street,
          number: !!data.number,
          neighborhood: !!data.neighborhood,
          cityId: !!data.cityId,
          zipCode: !!data.zipCode,
          country: !!data.country,
        });
        // Se não houver dados, não fazer nada (endereço é opcional ao salvar a loja)
        return;
      }
      
      // Verificar se cityId é um UUID válido
      if (!data.cityId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.cityId)) {
        console.error("❌ cityId inválido ou não é um UUID:", data.cityId);
        throw new Error("Por favor, selecione uma cidade válida");
      }
      
      console.log("✅ Endereço tem dados, validando...");
      
      // Validar todos os campos se houver dados
      const isValid = await trigger();
      if (!isValid) {
        console.error("❌ Validação do endereço falhou", {
          errors: Object.keys(errors),
          cityIdError: errors.cityId?.message,
        });
        throw new Error("Por favor, preencha todos os campos obrigatórios do endereço");
      }
      
      console.log("✅ Validação passou, salvando endereço...", { 
        isUpdate: !!storeAddress,
        addressId: storeAddress?.id,
        cityId: data.cityId,
        state: addressState,
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
            value={addressState || ""} 
            onValueChange={(value) => {
              console.log("📍 Estado selecionado pelo usuário:", value);
              // Não limpar se estamos apenas restaurando o estado do endereço existente
              if (storeAddress && cityForAddress?.state === value) {
                console.log("📍 Estado restaurado do endereço existente, mantendo cidade");
                setAddressState(value);
              } else {
                // Estado mudou manualmente, limpar seleção de cidade
                setAddressState(value);
                setCitySearchTerm("");
                setValue("cityId", "", { shouldValidate: false });
                clearErrors("cityId");
                setSelectedIBGECityId(null);
                console.log("✅ Estado atualizado, cityId limpo");
              }
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
              value={selectedIBGECityId ? selectedIBGECityId.toString() : ""}
              onValueChange={async (value) => {
                // Validar se há estado selecionado e se não está carregando
                if (!addressState || isLoadingCities || isLoadingCityUuid) {
                  console.log("📍 Select de cidade desabilitado, ignorando mudança de valor");
                  return;
                }

                // Validar se o valor não está vazio ou é uma string inválida
                if (!value || typeof value !== "string" || value.trim() === "" || value === "undefined" || value === "null") {
                  // Se o valor está vazio, apenas limpar a seleção silenciosamente
                  setSelectedIBGECityId(null);
                  setValue("cityId", "", { shouldValidate: false });
                  clearErrors("cityId");
                  return;
                }

                // Validar se é um número válido (ID do IBGE)
                const ibgeCityId = parseInt(value, 10);
                if (isNaN(ibgeCityId) || ibgeCityId <= 0) {
                  console.warn("⚠️ Valor inválido recebido no Select de cidade (não é um número válido):", value);
                  return;
                }

                // Verificar se há cidades disponíveis
                if (filteredCities.length === 0) {
                  console.warn("⚠️ Nenhuma cidade disponível para seleção");
                  return;
                }

                const selectedCity = filteredCities.find(c => c.id === ibgeCityId);
                
                if (!selectedCity) {
                  console.error("❌ Cidade do IBGE não encontrada na lista:", {
                    ibgeId: ibgeCityId,
                    value,
                    filteredCitiesCount: filteredCities.length,
                    firstFewCities: filteredCities.slice(0, 3).map(c => ({ id: c.id, name: c.name })),
                  });
                  return;
                }

                console.log("🏙️ Cidade do IBGE selecionada:", selectedCity.name, selectedCity.state);
                setSelectedIBGECityId(ibgeCityId);
                setIsLoadingCityUuid(true);
                setValue("cityId", "", { shouldValidate: false }); // Limpar temporariamente

                try {
                  // Buscar cidade no banco pelo nome e estado para obter o UUID
                  console.log("🔍 Buscando UUID da cidade no banco...");
                  let cityInDb;
                  try {
                    cityInDb = await citiesService.findByNameAndState(selectedCity.name, selectedCity.state);
                    console.log("✅ Cidade encontrada no banco com UUID:", cityInDb.id);
                  } catch (searchError: any) {
                    // Se não encontrou (404), tentar criar a cidade
                    if (searchError?.status === 404) {
                      console.log("📝 Cidade não encontrada no banco, criando...");
                      try {
                        cityInDb = await citiesService.create({
                          name: selectedCity.name,
                          state: selectedCity.state,
                        });
                        console.log("✅ Cidade criada no banco com UUID:", cityInDb.id);
                      } catch (createError: any) {
                        console.error("❌ Erro ao criar cidade no banco:", createError);
                        throw new Error(`Não foi possível criar a cidade "${selectedCity.name}" no banco de dados. Por favor, tente novamente.`);
                      }
                    } else {
                      throw searchError;
                    }
                  }
                  
                  // Atualizar o formulário com o UUID do banco
                  setValue("cityId", cityInDb.id, { shouldValidate: false });
                  clearErrors("cityId");
                  setCityUuidMap(prev => new Map(prev.set(`${selectedCity.name}-${selectedCity.state}`, cityInDb.id)));
                } catch (error: any) {
                  console.error("❌ Erro ao buscar/criar cidade no banco:", error);
                  showError(error?.message || `Erro ao processar a cidade "${selectedCity.name}". Por favor, tente novamente.`);
                  setSelectedIBGECityId(null);
                  setValue("cityId", "", { shouldValidate: false });
                } finally {
                  setIsLoadingCityUuid(false);
                }
              }}
              disabled={!addressState || isLoadingCities || isLoadingCityUuid}
              key={`${addressState}-${selectedIBGECityId || 'none'}`} // Forçar re-render quando estado ou cidade mudar
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !addressState 
                    ? "Selecione o estado primeiro"
                    : isLoadingCities 
                    ? "Carregando cidades..." 
                    : isLoadingCityUuid
                    ? "Buscando cidade no banco..."
                    : selectedIBGECityId && cityForAddress
                    ? cityForAddress.name // Mostrar nome da cidade se já estiver selecionada
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
                      : ibgeCitiesList.length === 0
                      ? "Nenhuma cidade disponível para este estado"
                      : "Nenhuma cidade encontrada"}
                  </div>
                ) : (
                  filteredCities.map((city) => (
                    <SelectItem key={city.id} value={city.id.toString()}>
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

