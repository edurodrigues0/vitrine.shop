import type { Address } from "~/database/schema";
import type { AddressesRepository } from "~/repositories/addresses-repository";
import type { StoresRepository } from "~/repositories/stores-repository";
import { StoreNotFoundError } from "../@errors/stores/store-not-found-error";

interface CreateAddressesUseCaseRequest {
	street: string;
	number: string;
	complement: string;
	neighborhood: string;
	cityId: string;
	zipCode: string;
	country: string;
	storeId?: string;
	isMain?: boolean;
}

interface CreateAddressesUseCaseResponse {
	address: Address;
}

export class CreateAddressesUseCase {
	constructor(
		private readonly addressesRepository: AddressesRepository,
		private readonly storesRepository: StoresRepository,
	) {}

	async execute({
		cityId,
		complement,
		country,
		neighborhood,
		number,
		street,
		zipCode,
		storeId,
		isMain = false,
	}: CreateAddressesUseCaseRequest): Promise<CreateAddressesUseCaseResponse> {
		if (storeId) {
			const store = await this.storesRepository.findById({ id: storeId });

			if (!store) {
				throw new StoreNotFoundError();
			}
		}

		const address = await this.addressesRepository.create({
			street,
			number,
			complement,
			neighborhood,
			cityId,
			zipCode,
			country,
			storeId,
			isMain,
		});

		return { address };
	}
}
