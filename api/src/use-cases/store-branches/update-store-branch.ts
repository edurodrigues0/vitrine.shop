import type { StoreBranch } from "~/database/schema";
import type { StoreBranchesRepository } from "~/repositories/store-branches-repository";
import { BranchNotFoundError } from "../@errors/store-branches/branch-not-found-error";

interface UpdateStoreBranchUseCaseRequest {
	id: string;
	data: {
		name?: string;
		cityId?: string;
		whatsapp?: string;
		description?: string;
		isMain?: boolean;
		logoUrl?: string;
	};
}

interface UpdateStoreBranchUseCaseResponse {
	branch: StoreBranch;
}

export class UpdateStoreBranchUseCase {
	constructor(
		private readonly storeBranchesRepository: StoreBranchesRepository,
	) {}

	async execute({
		id,
		data,
	}: UpdateStoreBranchUseCaseRequest): Promise<UpdateStoreBranchUseCaseResponse> {
		const branch = await this.storeBranchesRepository.update({
			id,
			data,
		});

		if (!branch) {
			throw new BranchNotFoundError();
		}

		return { branch };
	}
}
