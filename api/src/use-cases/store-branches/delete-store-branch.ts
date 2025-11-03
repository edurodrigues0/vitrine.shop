import type { StoreBranchesRepository } from "~/repositories/store-branches-repository";
import { BranchNotFoundError } from "../@errors/store-branches/branch-not-found-error";

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
			throw new BranchNotFoundError();
		}

		await this.storeBranchesRepository.delete({ id });
	}
}
