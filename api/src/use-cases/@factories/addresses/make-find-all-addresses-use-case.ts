import { DrizzleORM } from "~/database/connection";
import { DrizzleAddressesRepository } from "~/repositories/drizzle/addresses-repository";
import { FindAllAddressesUseCase } from "~/use-cases/addresses/find-all-addresses";

export function makeFindAllAddressesUseCase() {
	const addressesRepository = new DrizzleAddressesRepository(DrizzleORM);
	return new FindAllAddressesUseCase(addressesRepository);
}

