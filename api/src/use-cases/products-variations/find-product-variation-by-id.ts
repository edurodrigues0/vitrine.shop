import type { ProductVariation } from "~/database/schema";
import type { ProductVariationsRepository } from "~/repositories/product-variations";
import { ProductVariationNotFoundError } from "../@errors/product-variations/product-variation-not-found-error";

interface FindProductVariationByIdUseCaseRequest {
	id: string;
}

interface FindProductVariationByIdUseCaseResponse {
	productVariation: ProductVariation;
}

export class FindProductVariationByIdUseCase {
	constructor(
		private readonly productVariationsRepository: ProductVariationsRepository,
	) {}

	async execute({
		id,
	}: FindProductVariationByIdUseCaseRequest): Promise<FindProductVariationByIdUseCaseResponse> {
		const productVariation = await this.productVariationsRepository.findById({
			id,
		});

		if (!productVariation) {
			throw new ProductVariationNotFoundError();
		}

		return { productVariation };
	}
}
