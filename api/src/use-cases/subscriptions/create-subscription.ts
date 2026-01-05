import type { Subscription } from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";
import type { SubscriptionsRepository } from "~/repositories/subscriptions-repository";
import type { UsersRepository } from "~/repositories/users-repository";
import { UserNotFoundError } from "../@errors/users/user-not-found-error";
import { FailedToCreateSubscriptionError } from "../@errors/subscriptions/failed-to-create-subscription-error";

interface CreateSubscriptionUseCaseRequest {
	userId: string;
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
		private readonly usersRepository: UsersRepository,
	) {}

	async execute({
		userId,
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
		// Validar se usuário existe
		const user = await this.usersRepository.findById({ id: userId });

		if (!user) {
			throw new UserNotFoundError();
		}

		// Criar subscription
		const subscription = await this.subscriptionsRepository.create({
			userId,
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

		// Atualizar isPaid de todas as lojas do usuário para true se status for PAID
		if (status === "PAID") {
			const { stores } = await this.storesRepository.findAll({
				page: 1,
				limit: 1000,
				filters: {
					ownerId: userId,
				},
			});

			// Atualizar todas as lojas do usuário
			await Promise.all(
				stores.map((store) =>
					this.storesRepository.update({
						id: store.id,
						data: {
							isPaid: true,
						},
					}),
				),
			);
		}

		return { subscription };
	}
}

