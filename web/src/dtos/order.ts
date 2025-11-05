export interface Order {
  id: string;
  storeId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  total: number; // Total em centavos
  status: "PENDENTE" | "CONFIRMADO" | "PREPARANDO" | "ENVIADO" | "ENTREGUE" | "CANCELADO";
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productVariationId: string;
  quantity: number;
  price: number; // Preço unitário em centavos
}

export interface CreateOrderRequest {
  storeId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: Array<{
    productVariationId: string;
    quantity: number;
  }>;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: "PENDENTE" | "CONFIRMADO" | "PREPARANDO" | "ENVIADO" | "ENTREGUE" | "CANCELADO";
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}

export interface FindOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  storeId?: string;
  customerName?: string;
  customerPhone?: string;
}

