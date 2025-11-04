import { api } from "@/lib/api-client";
import type {
  CategoriesResponse,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/dtos/category";

export const categoriesService = {
  create: async (data: CreateCategoryRequest): Promise<{ id: string }> => {
    const response = await api.post<{ id: string }>("/categories", data);
    return response;
  },

  findAll: async (): Promise<CategoriesResponse> => {
    const response = await api.get<CategoriesResponse>("/categories");
    return response;
  },

  findBySlug: async (slug: string): Promise<Category> => {
    const response = await api.get<Category>(`/categories/slug/${slug}`);
    return response;
  },

  update: async (
    id: string,
    data: UpdateCategoryRequest,
  ): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

