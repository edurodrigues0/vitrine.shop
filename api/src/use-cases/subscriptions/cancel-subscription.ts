import type { StoresRepository } from "~/repositories/stores-repository";
import type { SubscriptionsRepository } from "~/repositories/subscriptions-repository";
import { StripeService } from "~/services/payment/stripe-service";
import { SubscriptionNotFoundError } from "../@errors/subscriptions/subscription-not-found-error";

interface CancelSubscriptionUseCaseRequest {
	id: string;
	immediately?: boolean;
}

interface CancelSubscriptionUseCaseResponse {
	subscription: {
		id: string;
		status: "PAID" | "PENDING" | "CANCELLED";
	};
}

export class CancelSubscriptionUseCase {
	constructor(
		private readonly subscriptionsRepository: SubscriptionsRepository,
		private readonly storesRepository: StoresRepository,
		private readonly stripeService: StripeService,
	) {}

	async execute({
		id,
		immediately = false,
	}: CancelSubscriptionUseCaseRequest): Promise<CancelSubscriptionUseCaseResponse> {
		// Buscar subscription
		const subscription = await this.subscriptionsRepository.findById({ id });

		if (!subscription) {
			throw new SubscriptionNotFoundError();
		}

		// Cancelar no Stripe se tiver stripeSubscriptionId
		if (subscription.stripeSubscriptionId) {
			await this.stripeService.cancelSubscription(
				subscription.stripeSubscriptionId,
				immediately,
			);
		}

		// Atualizar status para CANCELLED
		const updatedSubscription = await this.subscriptionsRepository.update({
			id,
			data: {
				status: "CANCELLED",
			},
		});

		if (!updatedSubscription) {
			throw new Error("Failed to update subscription");
		}

		// Atualizar isPaid de todas as lojas do usuário para false
		const { stores } = await this.storesRepository.findAll({
			page: 1,
			limit: 1000,
			filters: {
				ownerId: subscription.userId,
			},
		});

		// Atualizar todas as lojas do usuário
		await Promise.all(
			stores.map((store) =>
				this.storesRepository.update({
					id: store.id,
					data: {
						isPaid: false,
					},
				}),
			),
		);

		return {
			subscription: {
				id: updatedSubscription.id,
				status: updatedSubscription.status,
			},
		};
	}
}

