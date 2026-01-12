import type { ProductVariationsRepository } from "~/repositories/product-variations";
import type { VariantAttributesRepository } from "~/repositories/variant-attributes-repository";
import { ProductVariationNotFoundError } from "../@errors/product-variations/product-variation-not-found-error";
import { VariantAttributeNotFoundError } from "../@errors/variant-attributes/variant-attribute-not-found-error";

interface DeleteVariantAttributeUseCaseRequest {
	variantId: string;
	attributeId: string;
}

export class DeleteVariantAttributeUseCase {
	constructor(
		private readonly variantAttributesRepository: VariantAttributesRepository,
		private readonly productVariationsRepository: ProductVariationsRepository,
	) {}

	async execute({
		variantId,
		attributeId,
	}: DeleteVariantAttributeUseCaseRequest): Promise<void> {
		const variant = await this.productVariationsRepository.findById({
			id: variantId,
		});

		if (!variant) {
			throw new ProductVariationNotFoundError();
		}

		const existingAttributes =
			await this.variantAttributesRepository.findByVariantId({
				variantId,
			});

		const exists = existingAttributes.some(
			(attr) => attr.attributeId === attributeId,
		);

		if (!exists) {
			throw new VariantAttributeNotFoundError();
		}

		await this.variantAttributesRepository.delete({
			variantId,
			attributeId,
		});
	}
}

