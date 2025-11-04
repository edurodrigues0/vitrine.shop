import { api } from "@/lib/api-client";
import type {
  CitiesResponse,
  City,
  CreateCityRequest,
  UpdateCityRequest,
} from "@/dtos/city";

export const citiesService = {
  create: async (data: CreateCityRequest): Promise<{ id: string }> => {
    const response = await api.post<{ id: string }>("/cities", data);
    return response;
  },

  findAll: async (): Promise<CitiesResponse> => {
    const response = await api.get<CitiesResponse>("/cities");
    return response;
  },

  findByNameAndState: async (
    name: string,
    state: string,
  ): Promise<City> => {
    const response = await api.get<City>("/cities/name-and-state", {
      name,
      state,
    });
    return response;
  },

  update: async (id: string, data: UpdateCityRequest): Promise<City> => {
    const response = await api.put<City>(`/cities/${id}`, data);
    return response;
  },
};

