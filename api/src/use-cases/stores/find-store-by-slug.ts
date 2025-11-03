import type { Store } from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";
import { StoreNotFoundError } from "../@errors/stores/store-not-found-error";

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
			throw new StoreNotFoundError();
		}

		return { store };
	}
}
