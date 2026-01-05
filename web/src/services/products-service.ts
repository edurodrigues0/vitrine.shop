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
    const response = await api.get<{ product: Product }>(`/products/${id}`);
    return response.product;
  },

  findByStoreId: async (storeId: string): Promise<Product[]> => {
    if (!storeId) {
      console.warn("findByStoreId called without storeId");
      return [];
    }
    
    try {
      const response = await api.get<{ products: Product[] }>(`/products/store/${storeId}`);

      return response.products || [];
    } catch (error) {
      console.error("Error in findByStoreId:", error);
      // Se o erro for de conexão, retornar array vazio em vez de quebrar a UI
      if (error instanceof Error && error.message.includes("conexão")) {
        console.warn("API não está acessível, retornando array vazio");
        return [];
      }
      throw error;
    }
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

