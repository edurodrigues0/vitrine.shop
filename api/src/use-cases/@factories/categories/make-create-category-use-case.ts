import { DrizzleORM } from "~/database/connection";
import { DrizzleCategoriesRepository } from "~/repositories/drizzle/categories-respository";
import { CreateCategoryUseCase } from "~/use-cases/categories/create-category";

export function makeCreateCategoryUseCase() {
	const categoriesRepository = new DrizzleCategoriesRepository(DrizzleORM);
	const useCase = new CreateCategoryUseCase(categoriesRepository);

	return useCase;
}
