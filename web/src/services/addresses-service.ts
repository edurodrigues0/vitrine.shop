import { api } from "@/lib/api-client";

export interface Address {
  id: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  cityId: string;
  zipCode: string;
  country: string;
  storeId: string | null;
  isMain: boolean;
}

export interface CreateAddressRequest {
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  cityId: string;
  zipCode: string;
  country: string;
  storeId?: string | null;
  isMain?: boolean;
}

export interface UpdateAddressRequest {
  street?: string;
  number?: string;
  complement?: string | null;
  neighborhood?: string;
  cityId?: string;
  zipCode?: string;
  country?: string;
  storeId?: string | null;
  isMain?: boolean;
}

export interface AddressesResponse {
  addresses: Address[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

export const addressesService = {
  create: async (data: CreateAddressRequest): Promise<Address> => {
    const response = await api.post<{ address: Address }>("/addresses", data);
    return response.address;
  },

  findAll: async (params?: {
    page?: number;
    limit?: number;
    storeId?: string;
  }): Promise<AddressesResponse> => {
    const response = await api.get<AddressesResponse>("/addresses", params);
    return response;
  },

  findById: async (id: string): Promise<Address> => {
    const response = await api.get<{ address: Address }>(`/addresses/${id}`);
    return response.address;
  },

  update: async (id: string, data: UpdateAddressRequest): Promise<Address> => {
    const response = await api.put<{ address: Address }>(`/addresses/${id}`, data);
    return response.address;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/addresses/${id}`);
  },
};

