import type { Category } from "~/database/schema";
import type { CategoriesRespository } from "~/repositories/categories-repository";

interface UpdateCategoryUseCaseRequest {
	id: string;
	data: {
		name?: string;
		slug?: string;
	};
}

interface UpdateCategoryUseCaseResponse {
	category: Category | null;
}

export class UpdateCategoryUseCase {
	constructor(private readonly categoriesRepository: CategoriesRespository) {}

	async execute({
		id,
		data,
	}: UpdateCategoryUseCaseRequest): Promise<UpdateCategoryUseCaseResponse> {
		const category = await this.categoriesRepository.findById({ id });

		if (!category) {
			throw new Error("Category not found");
		}

		const updatedCategory = await this.categoriesRepository.update({
			id,
			data,
		});

		if (!updatedCategory) {
			throw new Error("Failed to update category");
		}

		return { category: updatedCategory };
	}
}
