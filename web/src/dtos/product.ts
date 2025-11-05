export interface Product {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  storeId: string;
  price: number | null; // Preço em centavos
  quantity: number; // Quantidade em estoque
  color: string | null; // Cor do produto
  createdAt: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  categoryId: string;
  storeId: string;
  price?: number; // Preço em centavos
  quantity?: number; // Quantidade em estoque
  color?: string; // Cor do produto
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  categoryId?: string;
  price?: number; // Preço em centavos
  quantity?: number; // Quantidade em estoque
  color?: string; // Cor do produto
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

