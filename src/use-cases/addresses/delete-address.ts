import type { AddressesRepository } from "~/repositories/addresses-repository";

interface DeleteAddressUseCaseRequest {
	id: string;
}

export class DeleteAddressUseCase {
	constructor(private readonly addressesRepository: AddressesRepository) {}

	async execute({ id }: DeleteAddressUseCaseRequest): Promise<void> {
		const address = await this.addressesRepository.findById({ id });

		if (!address) {
			throw new Error("Address not found");
		}

		await this.addressesRepository.delete({ id });
	}
}
