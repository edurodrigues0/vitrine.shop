export interface Product {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  storeId: string;
  createdAt: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  categoryId: string;
  storeId: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  categoryId?: string;
}

export interface FindAllProductsParams {
  page?: number;
  limit?: number;
  name?: string;
  categoryId?: string;
  storeId?: string;
  cityId?: string;
}

export interface ProductsResponse {
  products: Product[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

