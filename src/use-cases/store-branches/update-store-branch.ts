import type { StoreBranch } from "~/database/schema";
import type { StoreBranchesRepository } from "~/repositories/store-branches-repository";

interface UpdateStoreBranchUseCaseRequest {
	id: string;
	data: {
		name?: string;
		cityId?: string;
		whatsapp?: string;
		description?: string;
		isMain?: boolean;
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
			throw new Error("Branch not found");
		}

		return { branch };
	}
}
