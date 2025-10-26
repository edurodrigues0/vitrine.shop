import type { Category } from "~/database/schema";
import type { CategoriesRespository } from "~/repositories/categories-repository";

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
			throw new Error("Category not found");
		}

		return { category };
	}
}
