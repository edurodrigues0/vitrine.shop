import { DrizzleORM } from "~/database/connection";
import { DrizzleAddressesRepository } from "~/repositories/drizzle/addresses-repository";
import { FindAddressesByIdUseCase } from "~/use-cases/addresses/find-addresse-by-id";

export function makeFindAddressByIdUseCase() {
	const addressesRepository = new DrizzleAddressesRepository(DrizzleORM);
	return new FindAddressesByIdUseCase(addressesRepository);
}

