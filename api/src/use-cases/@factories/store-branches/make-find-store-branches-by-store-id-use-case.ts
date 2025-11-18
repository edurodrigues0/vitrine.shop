import { DrizzleORM } from "~/database/connection";
import { DrizzleStoreBranchesRepository } from "~/repositories/drizzle/store-branches-repository";
import { FindStoreBranchesByStoreIdUseCase } from "~/use-cases/store-branches/find-store-branches-by-store-id";

export function makeFindStoreBranchesByStoreIdUseCase() {
	const storeBranchesRepository = new DrizzleStoreBranchesRepository(DrizzleORM);
	return new FindStoreBranchesByStoreIdUseCase(storeBranchesRepository);
}

