import type { StoreBranch } from "~/database/schema";
import type { StoreBranchesRepository } from "~/repositories/store-branches-repository";

interface FindStoreBranchesByStoreIdUseCaseRequest {
	storeId: string;
}

interface FindStoreBranchesByStoreIdUseCaseResponse {
	branches: StoreBranch[];
}

export class FindStoreBranchesByStoreIdUseCase {
	constructor(
		private readonly storeBranchesRepository: StoreBranchesRepository,
	) {}

	async execute({
		storeId,
	}: FindStoreBranchesByStoreIdUseCaseRequest): Promise<FindStoreBranchesByStoreIdUseCaseResponse> {
		const branches =
			await this.storeBranchesRepository.findByStoreId({ storeId });

		return { branches };
	}
}

