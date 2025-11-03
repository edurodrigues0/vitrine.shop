import type { Store } from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";

interface FindAllStoresUseCaseRequest {
	page: number;
	limit: number;
	filters: {
		name?: string;
		description?: string;
		cnpjcpf?: string;
		whatsapp?: string;
		slug?: string;
		cityName?: string;
		ownerId?: string;
		isPaid?: boolean;
		createdAt?: Date;
	};
}

interface FindAllStoresUseCaseResponse {
	stores: Store[];
	pagination: {
		totalItems: number;
		totalPages: number;
		currentPage: number;
		perPage: number;
	};
}

export class FindAallStoresUseCase {
	constructor(private readonly storesRepository: StoresRepository) {}

	async execute({
		page,
		limit,
		filters,
	}: FindAllStoresUseCaseRequest): Promise<FindAllStoresUseCaseResponse> {
		const { stores, pagination } = await this.storesRepository.findAll({
			page,
			limit,
			filters,
		});

		return { stores, pagination };
	}
}
