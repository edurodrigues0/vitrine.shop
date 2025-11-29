"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin, Search } from "lucide-react";
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

export function AddressSection({ storeId }: { storeId: string }) {
  const queryClient = useQueryClient();
  const [addressState, setAddressState] = useState("");
  const [citySearchTerm, setCitySearchTerm] = useState("");

  // Buscar cidades do estado selecionado
  const { data: citiesData, isLoading: isLoadingCities } = useQuery({
    queryKey: ["cities", addressState],
    queryFn: async () => {
      if (!addressState) return { cities: [], meta: { totalItems: 0, totalPages: 0, currentPage: 1, perPage: 1000 } };
      return citiesService.findAll({ state: addressState, limit: 1000 });
    },
    enabled: !!addressState,
    staleTime: 1000 * 60 * 60,
  });

  const cities = citiesData?.cities || [];

  // Filtrar cidades por termo de busca
  const filteredCities = useMemo(() => {
    let result = cities.sort((a, b) => a.name.localeCompare(b.name));
    
    if (citySearchTerm.trim()) {
      const searchLower = citySearchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      result = result.filter(city => {
        const cityName = city.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return cityName.includes(searchLower);
      });
    }
    
    return result;
  }, [cities, citySearchTerm]);

  // Buscar endereço da loja
  const { data: addressesData, isLoading: isLoadingAddress } = useQuery({
    queryKey: ["addresses", storeId],
    queryFn: async () => {
      const response = await addressesService.findAll({ limit: 100 });
      const storeAddresses = response.addresses.filter(addr => addr.storeId === storeId);
      return storeAddresses.find(addr => addr.isMain) || storeAddresses[0] || null;
    },
  });

  const storeAddress = addressesData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
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

  const watchedCityId = watch("cityId");

  // Atualizar estado quando cidade for selecionada
  useEffect(() => {
    if (watchedCityId && cities.length > 0) {
      const city = cities.find(c => c.id === watchedCityId);
      if (city) {
        setAddressState(city.state);
      }
    }
  }, [watchedCityId, cities]);

  // Buscar cidade para carregar estado ao carregar endereço
  const { data: cityForAddress } = useQuery({
    queryKey: ["city", storeAddress?.cityId],
    queryFn: async () => {
      if (!storeAddress?.cityId) return null;
      // Buscar a cidade pelo ID para obter o estado
      const allCities = await citiesService.findAll({ limit: 1000 });
      return allCities.cities.find(c => c.id === storeAddress.cityId) || null;
    },
    enabled: !!storeAddress?.cityId && cities.length === 0,
  });

  // Carregar dados do endereço quando disponível
  useEffect(() => {
    if (storeAddress) {
      reset({
        street: storeAddress.street,
        number: storeAddress.number,
        complement: storeAddress.complement || "",
        neighborhood: storeAddress.neighborhood,
        cityId: storeAddress.cityId,
        zipCode: storeAddress.zipCode,
        country: storeAddress.country,
      });
      // Tentar obter o estado da cidade
      const city = cities.find(c => c.id === storeAddress.cityId) || cityForAddress;
      if (city) {
        setAddressState(city.state);
      }
    }
  }, [storeAddress, reset, cities, cityForAddress]);

  const createAddressMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      return addressesService.create({
        ...data,
        storeId: storeId,
        isMain: true,
        complement: data.complement || null,
      });
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
      return addressesService.update(storeAddress.id, {
        ...data,
        complement: data.complement || null,
      });
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

  // Formatar CEP
  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 8);
    setValue("zipCode", value);
  };

  if (isLoadingAddress) {
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
                  </div>
                ) : filteredCities.length === 0 ? (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    {citySearchTerm ? "Nenhuma cidade encontrada" : "Nenhuma cidade disponível"}
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

      <div className="flex gap-4 pt-4 border-t">
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
        >
          {(createAddressMutation.isPending || updateAddressMutation.isPending) ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              {storeAddress ? "Atualizar Endereço" : "Salvar Endereço"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

