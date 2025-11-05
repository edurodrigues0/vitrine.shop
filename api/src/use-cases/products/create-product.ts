import type { Product } from "~/database/schema";
import type { ProductsRespository } from "~/repositories/products-respository";

interface CreateProductUseCaseRequest {
	name: string;
	description?: string | null;
	categoryId: string;
	storeId: string;
	price?: number;
	quantity?: number;
	color?: string;
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
		price,
		quantity,
		color,
	}: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
		const product = await this.productsRepository.create({
			name,
			description,
			categoryId,
			storeId,
			price,
			quantity,
			color,
		});

		return { product };
	}
}
