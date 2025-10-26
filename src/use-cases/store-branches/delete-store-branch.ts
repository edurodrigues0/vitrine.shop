import type { StoreBranchesRepository } from "~/repositories/store-branches-repository";

interface DeleteStoreBranchUseCaseRequest {
	id: string;
}

export class DeleteStoreBranchUseCase {
	constructor(
		private readonly storeBranchesRepository: StoreBranchesRepository,
	) {}

	async execute({ id }: DeleteStoreBranchUseCaseRequest): Promise<void> {
		const branch = await this.storeBranchesRepository.findById({ id });

		if (!branch) {
			throw new Error("Branch not found");
		}

		await this.storeBranchesRepository.delete({ id });
	}
}
