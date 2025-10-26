import type { Store } from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";

interface UpdateStoreUseCaseRequest {
	id: string;
	data: {
		name?: string;
		description?: string;
		cnpjcpf?: string;
		logoUrl?: string;
		whatsapp?: string;
		slug?: string;
		instagramUrl?: string;
		facebookUrl?: string;
		bannerUrl?: string;
		theme?: string;
		cityId?: string;
	};
}

interface UpdateStoreUseCaseResponse {
	store: Store | null;
}

export class UpdateStoreUseCase {
	constructor(private readonly storesRepository: StoresRepository) {}

	async execute({
		id,
		data,
	}: UpdateStoreUseCaseRequest): Promise<UpdateStoreUseCaseResponse> {
		const store = await this.storesRepository.findById({
			id,
		});

		if (!store) {
			throw new Error("Store not found");
		}

		const updatedStore = await this.storesRepository.update({
			id,
			data,
		});

		if (!updatedStore) {
			throw new Error("Failed to update store");
		}

		return { store: updatedStore };
	}
}
