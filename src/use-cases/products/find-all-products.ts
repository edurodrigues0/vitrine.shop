import type { Pagination } from "~/@types/pagination";
import type { Product } from "~/database/schema";
import type { ProductsRespository } from "~/repositories/products-respository";

interface FindAllProductsUseCaseRequest {
	page: number;
	limit: number;
	filters: {
		name?: string;
		description?: string;
		categorySlug?: string;
		size?: string;
		stock?: number;
		weight?: number;
		dimensions?: Record<string, any>;
	};
}

interface FindAllProductsUseCaseResponse {
	products: Product[];
	pagination: Pagination;
}

export class FindAllProductsUseCase {
	constructor(private readonly productsRepository: ProductsRespository) {}

	async execute({
		page,
		limit,
		filters,
	}: FindAllProductsUseCaseRequest): Promise<FindAllProductsUseCaseResponse> {
		const { products, pagination } = await this.productsRepository.findAll({
			page,
			limit,
			filters,
		});

		return { products, pagination };
	}
}
