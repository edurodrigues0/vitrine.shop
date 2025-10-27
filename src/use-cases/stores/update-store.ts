import type { Store } from "~/database/schema";
import type { StoresRepository } from "~/repositories/stores-repository";
import { FailedToUpdateStoreError } from "../@errors/stores/failed-to-update-store-error";
import { StoreNotFoundError } from "../@errors/stores/store-not-found-error";

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
			throw new StoreNotFoundError();
		}

		const updatedStore = await this.storesRepository.update({
			id,
			data,
		});

		if (!updatedStore) {
			throw new FailedToUpdateStoreError();
		}

		return { store: updatedStore };
	}
}
