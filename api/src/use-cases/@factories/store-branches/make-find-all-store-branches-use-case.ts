import { DrizzleORM } from "~/database/connection";
import { DrizzleStoreBranchesRepository } from "~/repositories/drizzle/store-branches-repository";
import { FindAllStoreBranchesUseCase } from "~/use-cases/store-branches/find-all-store-branches";

export function makeFindAllStoreBranchesUseCase() {
	const storeBranchesRepository = new DrizzleStoreBranchesRepository(DrizzleORM);
	return new FindAllStoreBranchesUseCase(storeBranchesRepository);
}

