import type { Subscription } from "~/database/schema";
import type { SubscriptionsRepository } from "~/repositories/subscriptions-repository";

interface FindSubscriptionByUserIdUseCaseRequest {
	userId: string;
}

interface FindSubscriptionByUserIdUseCaseResponse {
	subscription: Subscription | null;
}

export class FindSubscriptionByUserIdUseCase {
	constructor(
		private readonly subscriptionsRepository: SubscriptionsRepository,
	) {}

	async execute({
		userId,
	}: FindSubscriptionByUserIdUseCaseRequest): Promise<FindSubscriptionByUserIdUseCaseResponse> {
		const subscription =
			await this.subscriptionsRepository.findByUserId({ userId });

		return { subscription };
	}
}

