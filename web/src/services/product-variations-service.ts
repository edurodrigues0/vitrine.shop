import { api } from "@/lib/api-client";
import type {
  CreateProductVariationRequest,
  ProductVariation,
  ProductVariationsResponse,
  UpdateProductVariationRequest,
} from "@/dtos/product-variation";

export const productVariationsService = {
  create: async (
    data: CreateProductVariationRequest,
  ): Promise<ProductVariation> => {
    const response = await api.post<{ productVariation: ProductVariation }>(
      "/product-variations",
      data,
    );
    return response.productVariation;
  },

  findById: async (id: string): Promise<ProductVariation> => {
    const response = await api.get<ProductVariation>(
      `/product-variations/${id}`,
    );
    return response;
  },

  findByProductId: async (
    productId: string,
  ): Promise<ProductVariationsResponse> => {
    const response = await api.get<ProductVariationsResponse>(
      `/product-variations/product/${productId}`,
    );
    return response;
  },

  update: async (
    id: string,
    data: UpdateProductVariationRequest,
  ): Promise<ProductVariation> => {
    const response = await api.put<ProductVariation>(
      `/product-variations/${id}`,
      { data },
    );
    return response;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/product-variations/${id}`);
  },
};

