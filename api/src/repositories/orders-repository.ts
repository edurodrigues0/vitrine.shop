import type { Order, OrderItem } from "~/database/schema";
import type { Pagination } from "~/@types/pagination";

export interface CreateOrderParams {
	storeId: string;
	customerName: string;
	customerPhone: string;
	customerEmail?: string;
	items: Array<{
		productVariationId: string;
		quantity: number;
		price: number; // Preço unitário em centavos
	}>;
	total: number; // Total em centavos
	notes?: string;
}

export interface FindAllOrdersParams {
	page: number;
	limit: number;
	filters: {
		storeId?: string;
		status?: string;
	};
}

export interface UpdateOrderStatusParams {
	id: string;
	status: "PENDENTE" | "CONFIRMADO" | "PREPARANDO" | "ENVIADO" | "ENTREGUE" | "CANCELADO";
}

export interface OrdersRepository {
	create(params: CreateOrderParams): Promise<Order>;
	findById({ id }: { id: string }): Promise<Order | null>;
	findAll(params: FindAllOrdersParams): Promise<{
		orders: Order[];
		pagination: Pagination;
	}>;
	findByStoreId({ storeId }: { storeId: string }): Promise<Order[]>;
	updateStatus(params: UpdateOrderStatusParams): Promise<Order | null>;
}

export interface OrderItemsRepository {
	createMany(items: Array<{
		orderId: string;
		productVariationId: string;
		quantity: number;
		price: number;
	}>): Promise<OrderItem[]>;
	findByOrderId({ orderId }: { orderId: string }): Promise<OrderItem[]>;
}

