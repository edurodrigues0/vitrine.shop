import type { Product } from "~/database/schema";
import type { ProductsRespository } from "~/repositories/products-respository";

interface FindProductsByStoreIdUseCaseRequest {
	storeId: string;
}

interface FindProductsByStoreIdUseCaseResponse {
	products: Product[];
}

export class FindProductsByStoreIdUseCase {
	constructor(private readonly productsRepository: ProductsRespository) {}

	async execute({
		storeId,
	}: FindProductsByStoreIdUseCaseRequest): Promise<FindProductsByStoreIdUseCaseResponse> {
		const products = await this.productsRepository.findByStoreId({ storeId });

		return { products };
	}
}
