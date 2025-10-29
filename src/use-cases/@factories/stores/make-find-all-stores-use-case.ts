import { DrizzleORM } from "~/database/connection";
import { DrizzleStoresRepository } from "~/repositories/drizzle/stores-repository";
import { FindAallStoresUseCase } from "~/use-cases/stores/find-all-stores";

export function makeFindAllStoresUseCase() {
	const storesRepository = new DrizzleStoresRepository(DrizzleORM);
	return new FindAallStoresUseCase(storesRepository);
}
