import { DrizzleORM } from "~/database/connection";
import { DrizzleStoresRepository } from "~/repositories/drizzle/stores-repository";
import { DrizzleSubscriptionsRepository } from "~/repositories/drizzle/subscriptions-repository";
import { CreateSubscriptionUseCase } from "~/use-cases/subscriptions/create-subscription";

export function makeCreateSubscriptionUseCase() {
	const subscriptionsRepository = new DrizzleSubscriptionsRepository(DrizzleORM);
	const storesRepository = new DrizzleStoresRepository(DrizzleORM);
	return new CreateSubscriptionUseCase(subscriptionsRepository, storesRepository);
}

