import type { Store } from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";

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
			throw new Error("Store not found");
		}

		return { store };
	}
}
