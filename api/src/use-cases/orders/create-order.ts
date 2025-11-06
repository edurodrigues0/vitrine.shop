import type { Order, OrderItem } from "~/database/schema";
import type { OrderItemsRepository, OrdersRepository } from "~/repositories/orders-repository";
import type { ProductVariationsRepository } from "~/repositories/product-variations";
import type { StoresRepository } from "~/repositories/stores-repository";
import type { NotificationsRepository } from "~/repositories/notifications-repository";
import { InsufficientStockError } from "../@errors/orders/insufficient-stock-error";
import { ProductVariationNotFoundError } from "../@errors/product-variations/product-variation-not-found-error";
import { sseService } from "~/services/sse-service";

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
		private readonly storesRepository: StoresRepository,
		private readonly notificationsRepository: NotificationsRepository,
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

		// NOTA: A baixa de estoque não é feita aqui, mas sim quando o status do pedido
		// mudar para CONFIRMADO, PREPARANDO, ENVIADO ou ENTREGUE.
		// Isso permite que pedidos pendentes sejam cancelados sem afetar o estoque.

		// Criar notificação para o dono da loja
		try {
			const store = await this.storesRepository.findById({ id: storeId });
			if (store) {
				const notification = await this.notificationsRepository.create({
					userId: store.ownerId,
					type: "NEW_ORDER",
					title: "Novo Pedido Recebido",
					message: `Você recebeu um novo pedido de ${customerName} no valor de R$ ${(total / 100).toFixed(2).replace(".", ",")}`,
					relatedId: order.id,
					relatedType: "order",
				});

				// Enviar via SSE
				sseService.sendNotification(store.ownerId, {
					type: "NEW_ORDER",
					title: notification.title,
					message: notification.message,
					notificationId: notification.id,
					relatedId: order.id,
					relatedType: "order",
				});
			}
		} catch (error) {
			// Não falhar a criação do pedido se a notificação falhar
			console.error("Error creating notification for new order:", error);
		}

		return {
			order,
			items: createdItems,
		};
	}
}

