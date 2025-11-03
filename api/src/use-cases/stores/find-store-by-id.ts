import type { Store } from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";
import { StoreNotFoundError } from "../@errors/stores/store-not-found-error";

interface FindStoreByIdUseCaseRequest {
	id: string;
}

interface FindStoreByIdUseCaseResponse {
	store: Store;
}

export class FindStoreByIdUseCase {
	constructor(private readonly storesRepository: StoresRepository) {}

	async execute({
		id,
	}: FindStoreByIdUseCaseRequest): Promise<FindStoreByIdUseCaseResponse> {
		const store = await this.storesRepository.findById({
			id,
		});

		if (!store) {
			throw new StoreNotFoundError();
		}

		return { store };
	}
}
