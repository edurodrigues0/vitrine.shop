import { DrizzleORM } from "~/database/connection";
import { DrizzleStoresRepository } from "~/repositories/drizzle/stores-repository";
import { DrizzleSubscriptionsRepository } from "~/repositories/drizzle/subscriptions-repository";
import { UpdateSubscriptionStatusUseCase } from "~/use-cases/subscriptions/update-subscription-status";

export function makeUpdateSubscriptionStatusUseCase() {
	const subscriptionsRepository = new DrizzleSubscriptionsRepository(DrizzleORM);
	const storesRepository = new DrizzleStoresRepository(DrizzleORM);
	return new UpdateSubscriptionStatusUseCase(
		subscriptionsRepository,
		storesRepository,
	);
}

