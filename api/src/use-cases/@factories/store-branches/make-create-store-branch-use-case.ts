import { DrizzleORM } from "~/database/connection";
import { DrizzleStoreBranchesRepository } from "~/repositories/drizzle/store-branches-repository";
import { CreateStoreBranchUseCase } from "~/use-cases/store-branches/create-store-branch";

export function makeCreateStoreBranchUseCase() {
	const storeBranchesRepository = new DrizzleStoreBranchesRepository(DrizzleORM);
	return new CreateStoreBranchUseCase(storeBranchesRepository);
}

