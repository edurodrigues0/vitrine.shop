import { api } from "@/lib/api-client";
import type {
  CreateProductImageRequest,
  ProductImage,
  ProductImagesResponse,
  UpdateProductImageRequest,
} from "@/dtos/product-image";

export const productImagesService = {
  create: async (
    data: CreateProductImageRequest,
  ): Promise<ProductImage> => {
    const response = await api.post<ProductImage>("/product-images", data);
    return response;
  },

  findByProductVariationId: async (
    productVariationId: string,
  ): Promise<ProductImagesResponse> => {
    const response = await api.get<ProductImagesResponse>(
      `/product-images/product-variation/${productVariationId}`,
    );
    return response;
  },

  update: async (
    id: string,
    data: UpdateProductImageRequest,
  ): Promise<ProductImage> => {
    const response = await api.put<ProductImage>(`/product-images/${id}`, {
      data,
    });
    return response;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/product-images/${id}`);
  },
};

