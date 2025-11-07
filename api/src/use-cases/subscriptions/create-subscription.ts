import type { Subscription } from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";
import type { SubscriptionsRepository } from "~/repositories/subscriptions-repository";
import { StoreNotFoundError } from "../@errors/stores/store-not-found-error";
import { FailedToCreateSubscriptionError } from "../@errors/subscriptions/failed-to-create-subscription-error";

interface CreateSubscriptionUseCaseRequest {
	storeId: string;
	planName: string;
	planId: string;
	provider: string;
	currentPeriodStart: Date;
	currentPeriodEnd: Date;
	price: string;
	status?: "PAID" | "PENDING" | "CANCELLED";
	nextPayment?: Date | null;
	stripeSubscriptionId?: string | null;
	stripeCustomerId?: string | null;
}

interface CreateSubscriptionUseCaseResponse {
	subscription: Subscription;
}

export class CreateSubscriptionUseCase {
	constructor(
		private readonly subscriptionsRepository: SubscriptionsRepository,
		private readonly storesRepository: StoresRepository,
	) {}

	async execute({
		storeId,
		planName,
		planId,
		provider,
		currentPeriodStart,
		currentPeriodEnd,
		price,
		status = "PENDING",
		nextPayment,
		stripeSubscriptionId,
		stripeCustomerId,
	}: CreateSubscriptionUseCaseRequest): Promise<CreateSubscriptionUseCaseResponse> {
		// Validar se loja existe
		const store = await this.storesRepository.findById({ id: storeId });

		if (!store) {
			throw new StoreNotFoundError();
		}

		// Criar subscription
		const subscription = await this.subscriptionsRepository.create({
			storeId,
			planName,
			planId,
			provider,
			currentPeriodStart,
			currentPeriodEnd,
			price,
			status,
			nextPayment,
			stripeSubscriptionId,
			stripeCustomerId,
		});

		if (!subscription) {
			throw new FailedToCreateSubscriptionError();
		}

		// Atualizar isPaid da loja para true se status for PAID
		if (status === "PAID") {
			await this.storesRepository.update({
				id: storeId,
				data: {
					isPaid: true,
				},
			});
		}

		return { subscription };
	}
}

