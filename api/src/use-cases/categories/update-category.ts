import type { Category } from "~/database/schema";
import type { CategoriesRespository } from "~/repositories/categories-repository";
import { CategoryNotFoundError } from "../@errors/categories/category-not-found-error";
import { FailedToUpdateCategoryError } from "../@errors/categories/failed-to-update-category-error";

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
			throw new CategoryNotFoundError();
		}

		const updatedCategory = await this.categoriesRepository.update({
			id,
			data,
		});

		if (!updatedCategory) {
			throw new FailedToUpdateCategoryError();
		}

		return { category: updatedCategory };
	}
}
