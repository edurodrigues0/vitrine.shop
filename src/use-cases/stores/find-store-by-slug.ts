import type { Store } from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";

interface FindStoreBySlugUseCaseRequest {
	slug: string;
}

interface FindStoreBySlugUseCaseResponse {
	store: Store;
}

export class FindStoreBySlugUseCase {
	constructor(private readonly storesRepository: StoresRepository) {}

	async execute({
		slug,
	}: FindStoreBySlugUseCaseRequest): Promise<FindStoreBySlugUseCaseResponse> {
		const store = await this.storesRepository.findBySlug({
			slug,
		});

		if (!store) {
			throw new Error("Store not found");
		}

		return { store };
	}
}
