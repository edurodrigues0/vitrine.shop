import type { Pagination } from "~/@types/pagination";
import type { Address } from "~/database/schema";
import type { AddressesRepository } from "~/repositories/addresses-repository";

interface FindAllAddressesUseCaseRequest {
	page: number;
	limit: number;
	filters: {
		street?: string;
		number?: string;
		complement?: string;
		neighborhood?: string;
		cityName?: string;
		state?: string;
		zipCode?: string;
		country?: string;
	};
}

interface FindAllAddressesUseCaseResponse {
	addresses: Address[];
	pagination: Pagination;
}

export class FindAllAddressesUseCase {
	constructor(private readonly addressesRepository: AddressesRepository) {}

	async execute({
		page,
		limit,
		filters,
	}: FindAllAddressesUseCaseRequest): Promise<FindAllAddressesUseCaseResponse> {
		const { addresses, pagination } = await this.addressesRepository.findAll({
			page,
			limit,
			filters,
		});

		return { addresses, pagination };
	}
}
