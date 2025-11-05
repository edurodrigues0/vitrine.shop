import { api } from "@/lib/api-client";
import type {
  CreateOrderRequest,
  FindOrdersParams,
  Order,
  OrdersResponse,
  UpdateOrderStatusRequest,
} from "@/dtos/order";

export const ordersService = {
  create: async (data: CreateOrderRequest): Promise<{ order: Order; items: any[] }> => {
    const response = await api.post<{ order: Order; items: any[] }>("/orders", data);
    return response;
  },

  findAll: async (params?: FindOrdersParams): Promise<OrdersResponse> => {
    const response = await api.get<OrdersResponse>("/orders", params);
    return response;
  },

  findById: async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response;
  },

  findItems: async (orderId: string): Promise<any[]> => {
    const response = await api.get<{ items: any[] }>(`/orders/${orderId}/items`);
    return response.items;
  },

  updateStatus: async (
    id: string,
    data: UpdateOrderStatusRequest,
  ): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${id}/status`, data);
    return response;
  },
};

