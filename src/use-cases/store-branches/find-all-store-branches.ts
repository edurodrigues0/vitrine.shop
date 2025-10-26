import type { StoreBranch } from "~/database/schema";
import type { StoreBranchesRepository } from "~/repositories/store-branches-repository";

interface FindAllStoreBranchesUseCaseRequest {
	page: number;
	limit: number;
	filters: {
		parentStoreId?: string;
		cityId?: string;
		name?: string;
		isMain?: boolean;
	};
}

interface FindAllStoreBranchesUseCaseResponse {
	branches: StoreBranch[];
	pagination: {
		totalItems: number;
		totalPages: number;
		currentPage: number;
		perPage: number;
	};
}

export class FindAllStoreBranchesUseCase {
	constructor(
		private readonly storeBranchesRepository: StoreBranchesRepository,
	) {}

	async execute({
		page,
		limit,
		filters,
	}: FindAllStoreBranchesUseCaseRequest): Promise<FindAllStoreBranchesUseCaseResponse> {
		const { branches, pagination } = await this.storeBranchesRepository.findAll(
			{
				page,
				limit,
				filters,
			},
		);

		return { branches, pagination };
	}
}
