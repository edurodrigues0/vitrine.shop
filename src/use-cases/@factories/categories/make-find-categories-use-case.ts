import { DrizzleORM } from "~/database/connection";
import { DrizzleCategoriesRepository } from "~/repositories/drizzle/categories-respository";
import { FindAllCategoriesUseCase } from "~/use-cases/categories/find-all-categories";

export function makeFindCategoriesUseCase() {
	const categoriesRepository = new DrizzleCategoriesRepository(DrizzleORM);
	const useCase = new FindAllCategoriesUseCase(categoriesRepository);

	return useCase;
}
