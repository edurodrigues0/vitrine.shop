export interface ProductImage {
  id: string;
  isMain: boolean;
  productVariationId: string;
  url: string;
  createdAt: string;
}

export interface CreateProductImageRequest {
  isMain?: boolean;
  productVariationId: string;
  url: string;
}

export interface UpdateProductImageRequest {
  isMain?: boolean;
  url?: string;
}

export interface ProductImagesResponse {
  productImages: ProductImage[];
}

