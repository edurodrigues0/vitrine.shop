import type { Product } from "~/database/schema";
import type { ProductsRespository } from "~/repositories/products-respository";

interface CreateProductUseCaseRequest {
	name: string;
	description?: string | null;
	categoryId: string;
	storeId: string;
}

interface CreateProductUseCaseResponse {
	product: Product;
}

export class CreateProductUseCase {
	constructor(private readonly productsRepository: ProductsRespository) {}

	async execute({
		name,
		description,
		categoryId,
		storeId,
	}: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
		const product = await this.productsRepository.create({
			name,
			description,
			categoryId,
			storeId,
		});

		return { product };
	}
}
