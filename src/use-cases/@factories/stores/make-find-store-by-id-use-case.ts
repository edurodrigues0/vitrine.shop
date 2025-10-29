import { DrizzleORM } from "~/database/connection";
import { DrizzleStoresRepository } from "~/repositories/drizzle/stores-repository";
import { FindStoreByIdUseCase } from "~/use-cases/stores/find-store-by-id";

export function makeFindStoreByIdUseCase() {
	const storesRepository = new DrizzleStoresRepository(DrizzleORM);
	return new FindStoreByIdUseCase(storesRepository);
}
