import type { Order } from "~/database/schema";
import type { OrdersRepository } from "~/repositories/orders-repository";
import type { Pagination } from "~/@types/pagination";

interface FindOrdersByStoreUseCaseRequest {
	storeId: string;
	page?: number;
	limit?: number;
	status?: string;
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
	}: FindOrdersByStoreUseCaseRequest): Promise<FindOrdersByStoreUseCaseResponse> {
		const result = await this.ordersRepository.findAll({
			page,
			limit,
			filters: {
				storeId,
				status,
			},
		});

		return result;
	}
}

