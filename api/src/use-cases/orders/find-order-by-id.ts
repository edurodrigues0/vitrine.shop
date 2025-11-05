import type { Order } from "~/database/schema";
import type { OrdersRepository } from "~/repositories/orders-repository";
import { OrderNotFoundError } from "../@errors/orders/order-not-found-error";

interface FindOrderByIdUseCaseRequest {
	id: string;
}

interface FindOrderByIdUseCaseResponse {
	order: Order;
}

export class FindOrderByIdUseCase {
	constructor(private readonly ordersRepository: OrdersRepository) {}

	async execute({
		id,
	}: FindOrderByIdUseCaseRequest): Promise<FindOrderByIdUseCaseResponse> {
		const order = await this.ordersRepository.findById({ id });

		if (!order) {
			throw new OrderNotFoundError();
		}

		return { order };
	}
}

