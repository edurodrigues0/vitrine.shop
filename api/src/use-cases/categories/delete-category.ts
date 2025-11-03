import type { CategoriesRespository } from "~/repositories/categories-repository";
import { CategoryNotFoundError } from "../@errors/categories/category-not-found-error";

interface DeleteCategoryUseCaseRequest {
	id: string;
}

export class DeleteCategoryUseCase {
	constructor(private readonly categoriesRepository: CategoriesRespository) {}

	async execute({ id }: DeleteCategoryUseCaseRequest): Promise<void> {
		const category = await this.categoriesRepository.findById({ id });

		if (!category) {
			throw new CategoryNotFoundError();
		}

		await this.categoriesRepository.delete({ id });
	}
}
