import { DrizzleORM } from "~/database/connection";
import { DrizzleAddressesRepository } from "~/repositories/drizzle/addresses-repository";
import { DeleteAddressUseCase } from "~/use-cases/addresses/delete-address";

export function makeDeleteAddressUseCase() {
	const addressesRepository = new DrizzleAddressesRepository(DrizzleORM);
	return new DeleteAddressUseCase(addressesRepository);
}

