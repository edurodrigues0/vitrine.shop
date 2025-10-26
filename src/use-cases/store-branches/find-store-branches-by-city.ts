import type { StoreBranch } from "~/database/schema";
import type { StoreBranchesRepository } from "~/repositories/store-branches-repository";

interface FindStoreBranchesByCityUseCaseRequest {
	storeId: string;
	cityId: string;
}

interface FindStoreBranchesByCityUseCaseResponse {
	branches: StoreBranch[];
}

export class FindStoreBranchesByCityUseCase {
	constructor(
		private readonly storeBranchesRepository: StoreBranchesRepository,
	) {}

	async execute({
		storeId,
		cityId,
	}: FindStoreBranchesByCityUseCaseRequest): Promise<FindStoreBranchesByCityUseCaseResponse> {
		const branches = await this.storeBranchesRepository.findByCityId({
			storeId,
			cityId,
		});

		return { branches };
	}
}
