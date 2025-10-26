import type { CategoriesRespository } from "~/repositories/categories-repository";

interface DeleteCategoryUseCaseRequest {
	id: string;
}

export class DeleteCategoryUseCase {
	constructor(private readonly categoriesRepository: CategoriesRespository) {}

	async execute({ id }: DeleteCategoryUseCaseRequest): Promise<void> {
		const category = await this.categoriesRepository.findById({ id });

		if (!category) {
			throw new Error("Category not found");
		}

		await this.categoriesRepository.delete({ id });
	}
}
