import { api } from "@/lib/api-client";
import type {
  CreateProductRequest,
  FindAllProductsParams,
  Product,
  ProductsResponse,
  UpdateProductRequest,
} from "@/dtos/product";

export const productsService = {
  create: async (data: CreateProductRequest): Promise<{ id: string }> => {
    const response = await api.post<{ id: string }>("/products", data);
    return response;
  },

  findAll: async (params?: FindAllProductsParams): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>("/products", params);
    return response;
  },

  findById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response;
  },

  findByStoreId: async (storeId: string): Promise<Product[]> => {
    const response = await api.get<Product[]>(`/products/store/${storeId}`);
    return response;
  },

  update: async (
    id: string,
    data: UpdateProductRequest,
  ): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

