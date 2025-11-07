import type { Order } from "~/database/schema";
import type { OrdersRepository, OrderItemsRepository } from "~/repositories/orders-repository";
import type { ProductVariationsRepository } from "~/repositories/product-variations";
import { OrderNotFoundError } from "../@errors/orders/order-not-found-error";

interface UpdateOrderStatusUseCaseRequest {
	id: string;
	status: "PENDENTE" | "CONFIRMADO" | "PREPARANDO" | "ENVIADO" | "ENTREGUE" | "CANCELADO";
}

interface UpdateOrderStatusUseCaseResponse {
	order: Order;
}

export class UpdateOrderStatusUseCase {
	constructor(
		private readonly ordersRepository: OrdersRepository,
		private readonly orderItemsRepository: OrderItemsRepository,
		private readonly productVariationsRepository: ProductVariationsRepository,
	) {}

	async execute({
		id,
		status,
	}: UpdateOrderStatusUseCaseRequest): Promise<UpdateOrderStatusUseCaseResponse> {
		const order = await this.ordersRepository.findById({ id });

		if (!order) {
			throw new OrderNotFoundError();
		}

		const oldStatus = order.status;
		const newStatus = status;

		// Status que fazem baixa no estoque
		const statusesThatDeductStock = ["CONFIRMADO", "PREPARANDO", "ENVIADO", "ENTREGUE"];
		// Fazer baixa se mudar de PENDENTE ou CANCELADO para um status que faz baixa
		const shouldDeductStock = 
			(oldStatus === "PENDENTE" || oldStatus === "CANCELADO") && 
			statusesThatDeductStock.includes(newStatus);

		// Status que devolvem estoque (quando cancelado)
		// Devolver se estava em um status que faz baixa e agora está cancelado
		const shouldReturnStock = 
			newStatus === "CANCELADO" && 
			oldStatus !== "CANCELADO" && 
			oldStatus !== "PENDENTE";

		// Se precisa ajustar estoque, buscar itens do pedido
		if (shouldDeductStock || shouldReturnStock) {
			const items = await this.orderItemsRepository.findByOrderId({ orderId: id });

			for (const item of items) {
				const variation = await this.productVariationsRepository.findById({
					id: item.productVariationId,
				});

				if (variation) {
					let newStock = variation.stock;

					if (shouldDeductStock) {
						// Validar estoque antes de baixar
						if (variation.stock < item.quantity) {
							throw new Error(
								`Estoque insuficiente para o produto. Disponível: ${variation.stock}, Necessário: ${item.quantity}`,
							);
						}
						// Baixar estoque
						newStock = variation.stock - item.quantity;
					} else if (shouldReturnStock) {
						// Devolver estoque
						newStock = variation.stock + item.quantity;
					}

					await this.productVariationsRepository.update({
						id: item.productVariationId,
						data: {
							stock: newStock,
						},
					});
				}
			}
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

