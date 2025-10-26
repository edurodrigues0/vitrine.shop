import type { Store } from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";

interface FindStoreByOwnerIdUseCaseRequest {
	ownerId: string;
}

interface FindStoreByOwnerIdUseCaseResponse {
	store: Store;
}

export class FindStoreByOwnerIdUseCase {
	constructor(private readonly storesRepository: StoresRepository) {}

	async execute({
		ownerId,
	}: FindStoreByOwnerIdUseCaseRequest): Promise<FindStoreByOwnerIdUseCaseResponse> {
		const store = await this.storesRepository.findByOwnerId({
			ownerId,
		});

		if (!store) {
			throw new Error("Store not found");
		}

		return { store };
	}
}
