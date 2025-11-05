import { api } from "@/lib/api-client";
import type {
  CreateProductImageRequest,
  ProductImage,
  ProductImagesResponse,
  UpdateProductImageRequest,
} from "@/dtos/product-image";

export const productImagesService = {
  create: async (
    file: File,
    productVariationId: string,
  ): Promise<ProductImage> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("productVariationId", productVariationId);

    const response = await api.post<{ productImage: ProductImage }>(
      "/product-images",
      formData,
      undefined,
      true, // isFormData
    );
    return response.productImage;
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

