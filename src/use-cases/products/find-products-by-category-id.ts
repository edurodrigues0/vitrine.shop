import type { Product } from "~/database/schema";
import type { ProductsRespository } from "~/repositories/products-respository";

interface FindProductsByCategoryIdUseCaseRequest {
	categoryId: string;
}

interface FindProductsByCategoryIdUseCaseResponse {
	products: Product[];
}

export class FindProductsByCategoryIdUseCase {
	constructor(private readonly productsRepository: ProductsRespository) {}

	async execute({
		categoryId,
	}: FindProductsByCategoryIdUseCaseRequest): Promise<FindProductsByCategoryIdUseCaseResponse> {
		const products = await this.productsRepository.findByCategoryId({
			categoryId,
		});

		return { products };
	}
}
