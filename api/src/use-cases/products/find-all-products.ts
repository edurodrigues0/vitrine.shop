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
		latitude?: number;
		longitude?: number;
	};
}

interface FindAllProductsUseCaseResponse {
	products: (Product & { storeSlug: string; citySlug: string; imageUrl?: string | null })[];
	pagination: Pagination;
}

export class FindAllProductsUseCase {
	constructor(private readonly productsRepository: ProductsRespository) { }

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
