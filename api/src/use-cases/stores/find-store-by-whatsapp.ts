import type { Store } from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";
import { StoreNotFoundError } from "../@errors/stores/store-not-found-error";

interface FindStoreByWhatsappUseCaseRequest {
	whatsapp: string;
}

interface FindStoreByWhatsappUseCaseResponse {
	store: Store;
}

export class FindStoreByWhatsappUseCase {
	constructor(private readonly storesRepository: StoresRepository) {}

	async execute({
		whatsapp,
	}: FindStoreByWhatsappUseCaseRequest): Promise<FindStoreByWhatsappUseCaseResponse> {
		const store = await this.storesRepository.findByWhatsapp({
			whatsapp,
		});

		if (!store) {
			throw new StoreNotFoundError();
		}

		return { store };
	}
}
