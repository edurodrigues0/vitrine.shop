import type { Address } from "~/database/schema";
import type { AddressesRepository } from "~/repositories/addresses-repository";

interface FindAddressesByIdUseCaseRequest {
	id: string;
}

interface FindAddressesByIdUseCaseResponse {
	address: Address;
}

export class FindAddressesByIdUseCase {
	constructor(private readonly addressesRepository: AddressesRepository) {}

	async execute({
		id,
	}: FindAddressesByIdUseCaseRequest): Promise<FindAddressesByIdUseCaseResponse> {
		const address = await this.addressesRepository.findById({ id });

		if (!address) {
			throw new Error("Address not found");
		}

		return { address };
	}
}
