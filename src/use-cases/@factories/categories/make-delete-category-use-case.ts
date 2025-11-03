import { DrizzleORM } from "~/database/connection";
import { DrizzleCategoriesRepository } from "~/repositories/drizzle/categories-respository";
import { DeleteCategoryUseCase } from "~/use-cases/categories/delete-category";

export function makeDeleteCategoryUseCase() {
	const categoriesRepository = new DrizzleCategoriesRepository(DrizzleORM);
	const useCase = new DeleteCategoryUseCase(categoriesRepository);

	return useCase;
}
