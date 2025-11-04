export interface ProductVariation {
  id: string;
  productId: string;
  size: string;
  color: string;
  weight: string | null;
  dimensions: Record<string, unknown> | null;
  discountPrice: number | null;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductVariationRequest {
  productId: string;
  size: string;
  color: string;
  weight?: string | null;
  dimensions?: Record<string, unknown> | null;
  discountPrice?: number | null;
  price: number;
  stock: number;
}

export interface UpdateProductVariationRequest {
  size?: string;
  color?: string;
  weight?: string | null;
  dimensions?: Record<string, unknown> | null;
  discountPrice?: number | null;
  price?: number;
  stock?: number;
}

export interface ProductVariationsResponse {
  productVariations: ProductVariation[];
}

