import type { Category } from "~/database/schema";
import type { CategoriesRespository } from "~/repositories/categories-repository";
import type { Pagination } from "~/types/pagination";

interface FindAllCategoriesUseCaseRequest {
	page: number;
	limit: number;
	filters: {
		name?: string;
		slug?: string;
	};
}

interface FindAllCategoriesUseCaseResponse {
	categories: Category[];
	pagination: Pagination;
}

export class FindAllCategoriesUseCase {
	constructor(private readonly categoriesRepository: CategoriesRespository) {}

	async execute({
		page,
		limit,
		filters,
	}: FindAllCategoriesUseCaseRequest): Promise<FindAllCategoriesUseCaseResponse> {
		const { categories, pagination } = await this.categoriesRepository.findAll({
			page,
			limit,
			filters,
		});

		return { categories, pagination };
	}
}
