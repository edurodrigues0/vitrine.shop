import { DrizzleORM } from "~/database/connection";
import { DrizzleStoresRepository } from "~/repositories/drizzle/stores-repository";
import { FindStoreBySlugUseCase } from "~/use-cases/stores/find-store-by-slug";

export function makeFindStoreBySlugUseCase() {
	const storesRepository = new DrizzleStoresRepository(DrizzleORM);
	return new FindStoreBySlugUseCase(storesRepository);
}
