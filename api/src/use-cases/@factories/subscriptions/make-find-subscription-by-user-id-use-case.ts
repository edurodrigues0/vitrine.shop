import { DrizzleORM } from "~/database/connection";
import { DrizzleSubscriptionsRepository } from "~/repositories/drizzle/subscriptions-repository";
import { FindSubscriptionByUserIdUseCase } from "~/use-cases/subscriptions/find-subscription-by-user-id";

export function makeFindSubscriptionByUserIdUseCase() {
	const subscriptionsRepository = new DrizzleSubscriptionsRepository(DrizzleORM);
	return new FindSubscriptionByUserIdUseCase(subscriptionsRepository);
}

