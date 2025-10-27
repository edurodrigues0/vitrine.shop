import type { Category } from "~/database/schema";
import type { CategoriesRespository } from "~/repositories/categories-repository";
import { CategoryNotFoundError } from "../@errors/categories/category-not-found-error";

interface FindCategoryByIdUseCaseRequest {
	id: string;
}

interface FindCategoryByIdUseCaseResponse {
	category: Category | null;
}

export class FindCategoryByIdUseCase {
	constructor(private readonly categoriesRepository: CategoriesRespository) {}

	async execute({
		id,
	}: FindCategoryByIdUseCaseRequest): Promise<FindCategoryByIdUseCaseResponse> {
		const category = await this.categoriesRepository.findById({ id });

		if (!category) {
			throw new CategoryNotFoundError();
		}

		return { category };
	}
}
