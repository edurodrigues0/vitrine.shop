import { DrizzleORM } from "~/database/connection";
import { DrizzleStoresRepository } from "~/repositories/drizzle/stores-repository";
import { CreateStoreUseCase } from "~/use-cases/stores/create-store";

export function makeCreateStoreUseCase() {
	const storesRepository = new DrizzleStoresRepository(DrizzleORM);
	return new CreateStoreUseCase(storesRepository);
}
