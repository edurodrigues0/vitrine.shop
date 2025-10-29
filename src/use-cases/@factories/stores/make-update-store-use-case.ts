import { DrizzleORM } from "~/database/connection";
import { DrizzleStoresRepository } from "~/repositories/drizzle/stores-repository";
import { UpdateStoreUseCase } from "~/use-cases/stores/update-store";

export function makeUpdateStoreUseCase() {
	const storesRepository = new DrizzleStoresRepository(DrizzleORM);
	return new UpdateStoreUseCase(storesRepository);
}
