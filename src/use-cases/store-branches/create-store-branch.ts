import type { StoreBranch } from "~/database/schema";
import type { StoreBranchesRepository } from "~/repositories/store-branches-repository";

interface CreateStoreBranchUseCaseRequest {
	parentStoreId: string;
	name: string;
	cityId: string;
	whatsapp?: string;
	description?: string;
	isMain?: boolean;
}

interface CreateStoreBranchUseCaseResponse {
	branch: StoreBranch;
}

export class CreateStoreBranchUseCase {
	constructor(
		private readonly storeBranchesRepository: StoreBranchesRepository,
	) {}

	async execute({
		parentStoreId,
		name,
		cityId,
		whatsapp,
		description,
		isMain = false,
	}: CreateStoreBranchUseCaseRequest): Promise<CreateStoreBranchUseCaseResponse> {
		const { branch } = await this.storeBranchesRepository.create({
			parentStoreId,
			name,
			cityId,
			whatsapp,
			description,
			isMain,
		});

		return { branch };
	}
}
