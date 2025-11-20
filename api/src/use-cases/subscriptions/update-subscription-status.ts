import type { Subscription } from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";
import type { SubscriptionsRepository } from "~/repositories/subscriptions-repository";
import { SubscriptionNotFoundError } from "../@errors/subscriptions/subscription-not-found-error";

interface UpdateSubscriptionStatusUseCaseRequest {
	id: string;
	status: "PAID" | "PENDING" | "CANCELLED";
	currentPeriodStart?: Date;
	currentPeriodEnd?: Date;
	nextPayment?: Date | null;
}

interface UpdateSubscriptionStatusUseCaseResponse {
	subscription: Subscription;
}

export class UpdateSubscriptionStatusUseCase {
	constructor(
		private readonly subscriptionsRepository: SubscriptionsRepository,
		private readonly storesRepository: StoresRepository,
	) {}

	async execute({
		id,
		status,
		currentPeriodStart,
		currentPeriodEnd,
		nextPayment,
	}: UpdateSubscriptionStatusUseCaseRequest): Promise<UpdateSubscriptionStatusUseCaseResponse> {
		// Buscar subscription
		const subscription = await this.subscriptionsRepository.findById({ id });

		if (!subscription) {
			throw new SubscriptionNotFoundError();
		}

		// Atualizar status
		const updatedSubscription = await this.subscriptionsRepository.update({
			id,
			data: {
				status,
				currentPeriodStart,
				currentPeriodEnd,
				nextPayment,
			},
		});

		if (!updatedSubscription) {
			throw new Error("Failed to update subscription");
		}

		// Sincronizar isPaid de todas as lojas do usuário conforme status
		const isPaid = status === "PAID";
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
						isPaid,
					},
				}),
			),
		);

		return { subscription: updatedSubscription };
	}
}

