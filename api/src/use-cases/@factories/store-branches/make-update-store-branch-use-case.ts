import { DrizzleORM } from "~/database/connection";
import { DrizzleStoreBranchesRepository } from "~/repositories/drizzle/store-branches-repository";
import { UpdateStoreBranchUseCase } from "~/use-cases/store-branches/update-store-branch";

export function makeUpdateStoreBranchUseCase() {
	const storeBranchesRepository = new DrizzleStoreBranchesRepository(DrizzleORM);
	return new UpdateStoreBranchUseCase(storeBranchesRepository);
}

