import type { Category } from "~/database/schema";
import type { CategoriesRespository } from "~/repositories/categories-repository";
import { CategoryNotFoundError } from "../@errors/categories/category-not-found-error";

interface FindCategoryBySlugUseCaseRequest {
	slug: string;
}

interface FindCategoryBySlugUseCaseResponse {
	category: Category | null;
}

export class FindCategoryBySlugUseCase {
	constructor(private readonly categoriesRepository: CategoriesRespository) {}

	async execute({
		slug,
	}: FindCategoryBySlugUseCaseRequest): Promise<FindCategoryBySlugUseCaseResponse> {
		const category = await this.categoriesRepository.findBySlug({ slug });

		if (!category) {
			throw new CategoryNotFoundError();
		}

		return { category };
	}
}
