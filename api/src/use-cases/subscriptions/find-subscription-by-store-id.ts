import type { Subscription } from "~/database/schema";
import type { SubscriptionsRepository } from "~/repositories/subscriptions-repository";

interface FindSubscriptionByStoreIdUseCaseRequest {
	storeId: string;
}

interface FindSubscriptionByStoreIdUseCaseResponse {
	subscription: Subscription | null;
}

export class FindSubscriptionByStoreIdUseCase {
	constructor(
		private readonly subscriptionsRepository: SubscriptionsRepository,
	) {}

	async execute({
		storeId,
	}: FindSubscriptionByStoreIdUseCaseRequest): Promise<FindSubscriptionByStoreIdUseCaseResponse> {
		const subscription =
			await this.subscriptionsRepository.findByStoreId({ storeId });

		return { subscription };
	}
}

