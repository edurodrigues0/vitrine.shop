import type { Address } from "~/database/schema";
import type { AddressesRepository } from "~/repositories/addresses-repository";

interface UpdateAddressUseCaseRequest {
	id: string;
	data: {
		street?: string;
		number?: string;
		complement?: string;
		neighborhood?: string;
		cityId?: string;
		zipCode?: string;
		country?: string;
		branchId?: string;
		storeId?: string;
		isMain?: boolean;
	};
}

interface UpdateAddressUseCaseResponse {
	address: Address | null;
}

export class UpdateAddressUseCase {
	constructor(private readonly addressesRepository: AddressesRepository) {}

	async execute({
		id,
		data,
	}: UpdateAddressUseCaseRequest): Promise<UpdateAddressUseCaseResponse> {
		const address = await this.addressesRepository.update({ id, data });

		if (!address) {
			throw new Error("Address not found");
		}

		return { address };
	}
}
