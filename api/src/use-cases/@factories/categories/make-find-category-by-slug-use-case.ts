import { DrizzleORM } from "~/database/connection";
import { DrizzleCategoriesRepository } from "~/repositories/drizzle/categories-respository";
import { FindCategoryBySlugUseCase } from "~/use-cases/categories/find-category-by-slug";

export function makeFindCategoryBySlugUseCase() {
	const categoriesRepository = new DrizzleCategoriesRepository(DrizzleORM);
	const useCase = new FindCategoryBySlugUseCase(categoriesRepository);

	return useCase;
}
