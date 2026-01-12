import type { VariantAttribute } from "~/database/schema";
import type { ProductVariationsRepository } from "~/repositories/product-variations";
import type { VariantAttributesRepository } from "~/repositories/variant-attributes-repository";
import { ProductVariationNotFoundError } from "../@errors/product-variations/product-variation-not-found-error";

interface FindVariantAttributesByVariantIdUseCaseRequest {
	variantId: string;
}

interface FindVariantAttributesByVariantIdUseCaseResponse {
	variantAttributes: VariantAttribute[];
}

export class FindVariantAttributesByVariantIdUseCase {
	constructor(
		private readonly variantAttributesRepository: VariantAttributesRepository,
		private readonly productVariationsRepository: ProductVariationsRepository,
	) {}

	async execute({
		variantId,
	}: FindVariantAttributesByVariantIdUseCaseRequest): Promise<FindVariantAttributesByVariantIdUseCaseResponse> {
		const variant = await this.productVariationsRepository.findById({
			id: variantId,
		});

		if (!variant) {
			throw new ProductVariationNotFoundError();
		}

		const variantAttributes =
			await this.variantAttributesRepository.findByVariantId({
				variantId,
			});

		return { variantAttributes };
	}
}

