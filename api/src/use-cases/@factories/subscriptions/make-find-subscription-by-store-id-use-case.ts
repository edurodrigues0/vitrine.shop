import { DrizzleORM } from "~/database/connection";
import { DrizzleSubscriptionsRepository } from "~/repositories/drizzle/subscriptions-repository";
import { FindSubscriptionByStoreIdUseCase } from "~/use-cases/subscriptions/find-subscription-by-store-id";

export function makeFindSubscriptionByStoreIdUseCase() {
	const subscriptionsRepository = new DrizzleSubscriptionsRepository(DrizzleORM);
	return new FindSubscriptionByStoreIdUseCase(subscriptionsRepository);
}

