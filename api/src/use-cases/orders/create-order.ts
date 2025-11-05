import type { Order, OrderItem } from "~/database/schema";
import type { OrderItemsRepository, OrdersRepository } from "~/repositories/orders-repository";
import type { ProductVariationsRepository } from "~/repositories/product-variations";
import { InsufficientStockError } from "../@errors/orders/insufficient-stock-error";
import { ProductVariationNotFoundError } from "../@errors/product-variations/product-variation-not-found-error";

interface CreateOrderUseCaseRequest {
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

interface CreateOrderUseCaseResponse {
	order: Order;
	items: OrderItem[];
}

export class CreateOrderUseCase {
	constructor(
		private readonly ordersRepository: OrdersRepository,
		private readonly orderItemsRepository: OrderItemsRepository,
		private readonly productVariationsRepository: ProductVariationsRepository,
	) {}

	async execute({
		storeId,
		customerName,
		customerPhone,
		customerEmail,
		items,
		notes,
	}: CreateOrderUseCaseRequest): Promise<CreateOrderUseCaseResponse> {
		// Validar estoque e calcular preços
		let total = 0;
		const orderItems = [];

		for (const item of items) {
			const variation = await this.productVariationsRepository.findById({
				id: item.productVariationId,
			});

			if (!variation) {
				throw new ProductVariationNotFoundError();
			}

			if (variation.stock < item.quantity) {
				throw new InsufficientStockError(
					`Estoque insuficiente para a variação ${variation.id}. Disponível: ${variation.stock}, Solicitado: ${item.quantity}`,
				);
			}

			const price = variation.discountPrice ?? variation.price;
			const itemTotal = price * item.quantity;
			total += itemTotal;

			orderItems.push({
				productVariationId: item.productVariationId,
				quantity: item.quantity,
				price,
			});
		}

		// Criar pedido
		const order = await this.ordersRepository.create({
			storeId,
			customerName,
			customerPhone,
			customerEmail,
			items: orderItems,
			total,
			notes,
		});

		// Criar itens do pedido
		const createdItems = await this.orderItemsRepository.createMany(
			orderItems.map((item) => ({
				orderId: order.id,
				productVariationId: item.productVariationId,
				quantity: item.quantity,
				price: item.price,
			})),
		);

		// Reduzir estoque das variações
		for (const item of items) {
			const variation = await this.productVariationsRepository.findById({
				id: item.productVariationId,
			});

			if (variation) {
				const newStock = variation.stock - item.quantity;
				await this.productVariationsRepository.update({
					id: item.productVariationId,
					data: {
						stock: newStock,
					},
				});
			}
		}

		return {
			order,
			items: createdItems,
		};
	}
}

