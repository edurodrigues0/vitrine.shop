import type { Product } from "~/database/schema";
import type { ProductsRespository } from "~/repositories/products-respository";

interface CreateProductUseCaseRequest {
	name: string;
	description: string;
	price: number;
	discountPrice?: number;
	stock: number;
	colors: string[];
	size?: string;
	weight?: number;
	dimensions?: Record<string, any>;
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
		price,
		discountPrice,
		stock,
		colors,
		size,
		weight,
		dimensions,
		categoryId,
		storeId,
	}: CreateProductUseCaseRequest): Promise<CreateProductUseCaseResponse> {
		const product = await this.productsRepository.create({
			name,
			description,
			price,
			discountPrice,
			stock,
			colors,
			size,
			weight,
			dimensions,
			categoryId,
			storeId,
		});

		return { product };
	}
}
