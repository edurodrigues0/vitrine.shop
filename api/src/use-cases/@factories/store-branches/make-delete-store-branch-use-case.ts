import { DrizzleORM } from "~/database/connection";
import { DrizzleStoreBranchesRepository } from "~/repositories/drizzle/store-branches-repository";
import { DeleteStoreBranchUseCase } from "~/use-cases/store-branches/delete-store-branch";

export function makeDeleteStoreBranchUseCase() {
	const storeBranchesRepository = new DrizzleStoreBranchesRepository(DrizzleORM);
	return new DeleteStoreBranchUseCase(storeBranchesRepository);
}

