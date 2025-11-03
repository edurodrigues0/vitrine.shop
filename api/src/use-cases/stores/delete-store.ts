import type { StoresRepository } from "~/repositories/stores-repository";
import { StoreNotFoundError } from "../@errors/stores/store-not-found-error";

interface DeleteStoreUseCaseRequest {
	id: string;
}

export class DeleteStoreUseCase {
	constructor(private readonly storesRepository: StoresRepository) {}

	async execute({ id }: DeleteStoreUseCaseRequest): Promise<void> {
		const store = await this.storesRepository.findById({
			id,
		});

		if (!store) {
			throw new StoreNotFoundError();
		}

		await this.storesRepository.delete({
			id,
		});
	}
}
