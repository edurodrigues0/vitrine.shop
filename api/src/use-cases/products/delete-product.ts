import type { ProductsRespository } from "~/repositories/products-respository";
import { ProductNotFoundError } from "../@errors/products/product-not-found-error";

interface DeleteProductUseCaseRequest {
	id: string;
}

export class DeleteProductUseCase {
	constructor(private readonly productsRepository: ProductsRespository) {}

	async execute({ id }: DeleteProductUseCaseRequest): Promise<void> {
		const product = await this.productsRepository.findById({ id });

		if (!product) {
			throw new ProductNotFoundError();
		}

		await this.productsRepository.delete({ id });
	}
}
