import type { CategoriesRespository } from "~/repositories/categories-repository";

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
			throw new Error("Category not found");
		}

		return { category };
	}
}
