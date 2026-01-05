import type { Product } from "~/database/schema";
import type { ProductsRespository } from "~/repositories/products-respository";
import type { StoresRepository } from "~/repositories/stores-repository";
import type { SubscriptionsRepository } from "~/repositories/subscriptions-repository";
import { PlanLimitsService } from "~/services/plan-limits-service";
import { StoreNotFoundError } from "../@errors/stores/store-not-found-error";
import { ProductLimitExceededError } from "../@errors/plans/product-limit-exceeded-error";
import { SubscriptionRequiredError } from "../@errors/plans/subscription-required-error";

interface CreateProductUseCaseRequest {
	name: string;
	description?: string | null;
	categoryId: string;
	storeId: string;
	price?: number;
	quantity?: number;
	color?: string;
}

interface CreateProductUseCaseResponse {
	product: Product;
}

export class CreateProductUseCase {
	constructor(
		private readonly productsRepository: ProductsRespository,
		private readonly storesRepository: StoresRepository,
		private readonly subscriptionsRepository: SubscriptionsRepository,
	) {}

	async execute({
		name,
		description,
		categoryId,
		storeId,
		price,
		quantity,
		color,
	}: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
		// Buscar loja
		const store = await this.storesRepository.findById({ id: storeId });

		if (!store) {
			throw new StoreNotFoundError();
		}

		// Buscar assinatura do dono da loja
		const subscription = await this.subscriptionsRepository.findByUserId({
			userId: store.ownerId,
		});

		// Validar se assinatura existe e está ativa
		if (!subscription) {
			throw new SubscriptionRequiredError();
		}

		if (subscription.status !== "PAID") {
			throw new SubscriptionRequiredError();
		}

		// Verificar se a assinatura não expirou
		const now = new Date();
		const periodEnd = new Date(subscription.currentPeriodEnd);

		if (now > periodEnd) {
			throw new SubscriptionRequiredError();
		}

		// Validar limite de produtos do plano
		const limits = PlanLimitsService.getLimits(subscription.planId);

		if (limits.maxProducts !== null) {
			const productCount = await this.productsRepository.countByStoreId({
				storeId,
			});

			if (PlanLimitsService.hasReachedLimit(productCount, limits.maxProducts)) {
				throw new ProductLimitExceededError(
					limits.maxProducts,
					productCount,
					subscription.planId,
				);
			}
		}

		const product = await this.productsRepository.create({
			name,
			description,
			categoryId,
			storeId,
			price,
			quantity,
			color,
		});

		return { product };
	}
}
