import { DrizzleORM } from "~/database/connection";
import { DrizzleCategoriesRepository } from "~/repositories/drizzle/categories-respository";
import { UpdateCategoryUseCase } from "~/use-cases/categories/update-category";

export function makeUpdateCategoryUseCase() {
	const categoriesRepository = new DrizzleCategoriesRepository(DrizzleORM);
	const useCase = new UpdateCategoryUseCase(categoriesRepository);

	return useCase;
}
