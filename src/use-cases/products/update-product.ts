import type { Product } from "~/database/schema";
import type { ProductsRespository } from "~/repositories/products-respository";

interface UpdateProductUseCaseRequest {
	id: string;
	data: {
		name?: string;
		description?: string;
		price?: number;
	};
}

interface UpdateProductUseCaseResponse {
	product: Product | null;
}

export class UpdateProductUseCase {
	constructor(private readonly productsRepository: ProductsRespository) {}

	async execute({
		id,
		data,
	}: UpdateProductUseCaseRequest): Promise<UpdateProductUseCaseResponse> {
		const product = await this.productsRepository.findById({ id });

		if (!product) {
			throw new Error("Product not found");
		}

		const updatedProduct = await this.productsRepository.update({
			id,
			data,
		});

		if (!updatedProduct) {
			throw new Error("Failed to update product");
		}

		return { product: updatedProduct };
	}
}
