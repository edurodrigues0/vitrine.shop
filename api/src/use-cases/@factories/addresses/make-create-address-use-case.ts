import { DrizzleORM } from "~/database/connection";
import { DrizzleAddressesRepository } from "~/repositories/drizzle/addresses-repository";
import { DrizzleStoresRepository } from "~/repositories/drizzle/stores-repository";
import { InMemoryStoreBranchesRepository } from "~/repositories/in-memory/in-memory-store-branches-repository";
import { CreateAddressesUseCase } from "~/use-cases/addresses/create-addresses";

export function makeCreateAddressUseCase() {
	const addressesRepository = new DrizzleAddressesRepository(DrizzleORM);
	const storesRepository = new DrizzleStoresRepository(DrizzleORM);
	const storeBranchesRepository = new InMemoryStoreBranchesRepository();

	return new CreateAddressesUseCase(
		addressesRepository,
		storesRepository,
		storeBranchesRepository,
	);
}

