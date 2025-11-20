import { DrizzleORM } from "~/database/connection";
import { DrizzleAddressesRepository } from "~/repositories/drizzle/addresses-repository";
import { DrizzleStoresRepository } from "~/repositories/drizzle/stores-repository";
import { CreateAddressesUseCase } from "~/use-cases/addresses/create-addresses";

export function makeCreateAddressUseCase() {
	const addressesRepository = new DrizzleAddressesRepository(DrizzleORM);
	const storesRepository = new DrizzleStoresRepository(DrizzleORM);

	return new CreateAddressesUseCase(
		addressesRepository,
		storesRepository,
	);
}

