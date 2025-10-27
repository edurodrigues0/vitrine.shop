import type { Product } from "~/database/schema";
import type { ProductsRespository } from "~/repositories/products-respository";
import { FailedToUpdateProductError } from "../@errors/products/failed-to-update-product-error";
import { ProductNotFoundError } from "../@errors/products/product-not-found-error";

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
			throw new ProductNotFoundError();
		}

		const updatedProduct = await this.productsRepository.update({
			id,
			data,
		});

		if (!updatedProduct) {
			throw new FailedToUpdateProductError();
		}

		return { product: updatedProduct };
	}
}
