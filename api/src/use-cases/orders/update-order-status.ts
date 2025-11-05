import type { Order } from "~/database/schema";
import type { OrdersRepository } from "~/repositories/orders-repository";
import { OrderNotFoundError } from "../@errors/orders/order-not-found-error";

interface UpdateOrderStatusUseCaseRequest {
	id: string;
	status: "PENDENTE" | "CONFIRMADO" | "PREPARANDO" | "ENVIADO" | "ENTREGUE" | "CANCELADO";
}

interface UpdateOrderStatusUseCaseResponse {
	order: Order;
}

export class UpdateOrderStatusUseCase {
	constructor(private readonly ordersRepository: OrdersRepository) {}

	async execute({
		id,
		status,
	}: UpdateOrderStatusUseCaseRequest): Promise<UpdateOrderStatusUseCaseResponse> {
		const order = await this.ordersRepository.findById({ id });

		if (!order) {
			throw new OrderNotFoundError();
		}

		const updatedOrder = await this.ordersRepository.updateStatus({
			id,
			status,
		});

		if (!updatedOrder) {
			throw new OrderNotFoundError();
		}

		return { order: updatedOrder };
	}
}

