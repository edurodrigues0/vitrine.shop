import type { ProductVariation } from "~/database/schema";
import type { ProductVariationsRepository } from "~/repositories/product-variations";
import type { ProductsRespository } from "~/repositories/products-respository";
import { ProductNotFoundError } from "../@errors/products/product-not-found-error";

interface FindProductVariationsByProductIdUseCaseRequest {
	productId: string;
}

interface FindProductVariationsByProductIdUseCaseResponse {
	productVariations: ProductVariation[];
}

export class FindProductVariationsByProductIdUseCase {
	constructor(
		private readonly productVariationsRepository: ProductVariationsRepository,
		private readonly productsRepository: ProductsRespository,
	) {}

	async execute({
		productId,
	}: FindProductVariationsByProductIdUseCaseRequest): Promise<FindProductVariationsByProductIdUseCaseResponse> {
		const product = await this.productsRepository.findById({ id: productId });

		if (!product) {
			throw new ProductNotFoundError();
		}

		const productVariations =
			await this.productVariationsRepository.findByProductId({ productId });

		return { productVariations };
	}
}
