import type { StoresRepository } from "~/repositories/stores-repository";

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
			throw new Error("Store not found");
		}

		await this.storesRepository.delete({
			id,
		});
	}
}
