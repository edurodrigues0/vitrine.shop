import { DrizzleORM } from "~/database/connection";
import { DrizzleAddressesRepository } from "~/repositories/drizzle/addresses-repository";
import { UpdateAddressUseCase } from "~/use-cases/addresses/update-address";

export function makeUpdateAddressUseCase() {
	const addressesRepository = new DrizzleAddressesRepository(DrizzleORM);
	return new UpdateAddressUseCase(addressesRepository);
}

