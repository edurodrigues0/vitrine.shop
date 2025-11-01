import type { ProductVariation } from "~/database/schema";
import type { ProductVariationsRepository } from "~/repositories/product-variations";
import type { ProductsRespository } from "~/repositories/products-respository";
import { FailedToCreateProductVariationError } from "../@errors/product-variations/failed-to-create-product-variation-error";
import { ProductNotFoundError } from "../@errors/products/product-not-found-error";

interface CreateProductVariationUseCaseRequest {
	productId: string;
	size: string;
	color: string;
	weight: string | null;
	dimensions: Record<string, unknown> | null;
	discountPrice: number | null;
	price: number;
	stock: number;
}

interface CreateProductVariationUseCaseResponse {
	productVariation: ProductVariation;
}

export class CreateProductVariationUseCase {
	constructor(
		private readonly productVariationsRepository: ProductVariationsRepository,
		private readonly productsRepository: ProductsRespository,
	) {}

	async execute({
		productId,
		size,
		color,
		weight,
		dimensions,
		discountPrice,
		price,
		stock,
	}: CreateProductVariationUseCaseRequest): Promise<CreateProductVariationUseCaseResponse> {
		const product = await this.productsRepository.findById({ id: productId });

		if (!product) {
			throw new ProductNotFoundError();
		}

		const productVariation = await this.productVariationsRepository.create({
			productId,
			size,
			color,
			weight,
			dimensions,
			discountPrice,
			price,
			stock,
		});

		if (!productVariation) {
			throw new FailedToCreateProductVariationError();
		}

		return { productVariation };
	}
}
