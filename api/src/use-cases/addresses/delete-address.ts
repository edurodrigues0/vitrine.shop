import type { AddressesRepository } from "~/repositories/addresses-repository";
import { AddressNotFoundError } from "../@errors/addresses/address-not-found-error";

interface DeleteAddressUseCaseRequest {
	id: string;
}

export class DeleteAddressUseCase {
	constructor(private readonly addressesRepository: AddressesRepository) {}

	async execute({ id }: DeleteAddressUseCaseRequest): Promise<void> {
		const address = await this.addressesRepository.findById({ id });

		if (!address) {
			throw new AddressNotFoundError();
		}

		await this.addressesRepository.delete({ id });
	}
}
