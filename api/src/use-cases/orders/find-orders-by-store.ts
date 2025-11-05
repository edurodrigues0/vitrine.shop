import type { Order } from "~/database/schema";
import type { OrdersRepository } from "~/repositories/orders-repository";
import type { Pagination } from "~/@types/pagination";

interface FindOrdersByStoreUseCaseRequest {
	storeId: string;
	page?: number;
	limit?: number;
	status?: string;
	customerName?: string;
	customerPhone?: string;
}

interface FindOrdersByStoreUseCaseResponse {
	orders: Order[];
	pagination: Pagination;
}

export class FindOrdersByStoreUseCase {
	constructor(private readonly ordersRepository: OrdersRepository) {}

	async execute({
		storeId,
		page = 1,
		limit = 10,
		status,
		customerName,
		customerPhone,
	}: FindOrdersByStoreUseCaseRequest): Promise<FindOrdersByStoreUseCaseResponse> {
		const result = await this.ordersRepository.findAll({
			page,
			limit,
			filters: {
				storeId,
				status,
				customerName,
				customerPhone,
			},
		});

		return result;
	}
}

