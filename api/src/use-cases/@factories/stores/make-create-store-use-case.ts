import { DrizzleORM } from "~/database/connection";
import { DrizzleStoresRepository } from "~/repositories/drizzle/stores-repository";
import { DrizzleSubscriptionsRepository } from "~/repositories/drizzle/subscriptions-repository";
import { CreateStoreUseCase } from "~/use-cases/stores/create-store";

export function makeCreateStoreUseCase() {
	const storesRepository = new DrizzleStoresRepository(DrizzleORM);
	const subscriptionsRepository = new DrizzleSubscriptionsRepository(DrizzleORM);
	return new CreateStoreUseCase(storesRepository, subscriptionsRepository);
}
