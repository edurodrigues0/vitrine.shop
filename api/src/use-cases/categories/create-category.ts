import type { Category } from "~/database/schema";
import type { CategoriesRespository } from "~/repositories/categories-repository";
import { CategoryAlreadyExistsError } from "../@errors/categories/category-already-exists-error";

interface CreateCategoryUseCaseRequest {
	name: string;
	slug: string;
}

interface CreateCategoryUseCaseResponse {
	category: Category;
}

export class CreateCategoryUseCase {
	constructor(private readonly categoriesRepository: CategoriesRespository) {}

	async execute({
		name,
		slug,
	}: CreateCategoryUseCaseRequest): Promise<CreateCategoryUseCaseResponse> {
		const categoryWithSameSlug = await this.categoriesRepository.findBySlug({
			slug,
		});

		if (categoryWithSameSlug) {
			throw new CategoryAlreadyExistsError();
		}

		const { category } = await this.categoriesRepository.create({ name, slug });

		return { category };
	}
}
