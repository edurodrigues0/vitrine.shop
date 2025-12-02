import { api } from "@/lib/api-client";
import type {
  CitiesResponse,
  City,
  CreateCityRequest,
  UpdateCityRequest,
} from "@/dtos/city";

export const citiesService = {
  create: async (data: CreateCityRequest): Promise<City> => {
    const response = await api.post<{ city: City }>("/cities", data);
    return response.city;
  },

  findAll: async (params?: { state?: string; name?: string; limit?: number; page?: number }): Promise<CitiesResponse> => {
    const response = await api.get<CitiesResponse>("/cities", params);
    return response;
  },

  findById: async (id: string): Promise<City> => {
    const response = await api.get<{ city: City }>(`/cities/${id}`);
    return response.city;
  },

  findByNameAndState: async (
    name: string,
    state: string,
  ): Promise<City> => {
    const response = await api.get<{ city: City }>("/cities/name-and-state", {
      name,
      state,
    });
    return response.city;
  },

  update: async (id: string, data: UpdateCityRequest): Promise<City> => {
    const response = await api.put<City>(`/cities/${id}`, data);
    return response;
  },
};

