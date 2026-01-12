import type { VariantAttribute } from "~/database/schema";
import type { AttributesRepository } from "~/repositories/attributes-repository";
import type { ProductVariationsRepository } from "~/repositories/product-variations";
import type { VariantAttributesRepository } from "~/repositories/variant-attributes-repository";
import { AttributeNotFoundError } from "../@errors/attributes/attribute-not-found-error";
import { ProductVariationNotFoundError } from "../@errors/product-variations/product-variation-not-found-error";
import { FailedToCreateVariantAttributeError } from "../@errors/variant-attributes/failed-to-create-variant-attribute-error";
import { VariantAttributeAlreadyExistsError } from "../@errors/variant-attributes/variant-attribute-already-exists-error";

interface CreateVariantAttributeUseCaseRequest {
	productVariantId: string;
	attributeId: string;
}

interface CreateVariantAttributeUseCaseResponse {
	variantAttribute: VariantAttribute;
}

export class CreateVariantAttributeUseCase {
	constructor(
		private readonly variantAttributesRepository: VariantAttributesRepository,
		private readonly productVariationsRepository: ProductVariationsRepository,
		private readonly attributesRepository: AttributesRepository,
	) {}

	async execute({
		productVariantId,
		attributeId,
	}: CreateVariantAttributeUseCaseRequest): Promise<CreateVariantAttributeUseCaseResponse> {
		const variant = await this.productVariationsRepository.findById({
			id: productVariantId,
		});

		if (!variant) {
			throw new ProductVariationNotFoundError();
		}

		const attribute = await this.attributesRepository.findById({
			id: attributeId,
		});

		if (!attribute) {
			throw new AttributeNotFoundError();
		}

		const existingAttributes =
			await this.variantAttributesRepository.findByVariantId({
				variantId: productVariantId,
			});

		const alreadyExists = existingAttributes.some(
			(attr) => attr.attributeId === attributeId,
		);

		if (alreadyExists) {
			throw new VariantAttributeAlreadyExistsError();
		}

		try {
			const variantAttribute =
				await this.variantAttributesRepository.create({
					productVariantId,
					attributeId,
				});

			return { variantAttribute };
		} catch (error) {
			throw new FailedToCreateVariantAttributeError();
		}
	}
}

