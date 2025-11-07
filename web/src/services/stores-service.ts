import { api } from "@/lib/api-client";
import type {
  CreateStoreRequest,
  FindAllStoresParams,
  Store,
  StoresResponse,
  UpdateStoreRequest,
} from "@/dtos/store";
import type { StoreStatistics } from "@/dtos/store-statistics";

export const storesService = {
  create: async (data: CreateStoreRequest): Promise<{ id: string }> => {
    const response = await api.post<{ id: string }>("/stores", data);
    return response;
  },

  findAll: async (params?: FindAllStoresParams): Promise<StoresResponse> => {
    const response = await api.get<StoresResponse>("/stores", params);
    return response;
  },

  findById: async (id: string): Promise<Store> => {
    const response = await api.get<{ store: Store }>(`/stores/${id}`);
    return response.store;
  },

  findBySlug: async (slug: string): Promise<Store> => {
    const response = await api.get<{ store: Store }>(`/stores/slug/${slug}`);
    console.log("Store response:", response);
    return response.store;
  },

  update: async (id: string, data: UpdateStoreRequest): Promise<Store> => {
    const response = await api.put<{ store: Store }>(`/stores/${id}`, data);
    return response.store;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/stores/${id}`);
  },

  getStatistics: async (id: string): Promise<StoreStatistics> => {
    const response = await api.get<{ statistics: StoreStatistics }>(
      `/stores/${id}/statistics`,
    );
    return response.statistics;
  },

  trackVisit: async (id: string): Promise<void> => {
    await api.post(`/stores/${id}/visit`);
  },

  getRecentActivities: async (
    id: string,
    params?: { limit?: number; days?: number },
  ): Promise<{
    activities: Array<{
      id: string;
      type: "ORDER" | "PRODUCT" | "VISIT";
      title: string;
      description: string;
      createdAt: string;
      relatedId?: string;
    }>;
  }> => {
    const response = await api.get<{
      activities: Array<{
        id: string;
        type: "ORDER" | "PRODUCT" | "VISIT";
        title: string;
        description: string;
        createdAt: string;
        relatedId?: string;
      }>;
    }>(`/stores/${id}/activities`, params);
    return response;
  },
};

