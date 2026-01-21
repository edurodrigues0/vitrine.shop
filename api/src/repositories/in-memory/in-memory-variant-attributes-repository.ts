import type { VariantAttribute } from "~/database/schema";
import type {
	CreateVariantAttributeParams,
	DeleteVariantAttributeParams,
	VariantAttributesRepository,
} from "../variant-attributes-repository";

export class InMemoryVariantAttributesRepository
	implements VariantAttributesRepository
{
	public items: VariantAttribute[] = [];

	async create({
		productVariantId,
		attributeId,
	}: CreateVariantAttributeParams): Promise<VariantAttribute> {
		const variantAttribute: VariantAttribute = {
			productVariantId,
			attributeId,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.items.push(variantAttribute);
		return variantAttribute;
	}

	async findByVariantId({
		variantId,
	}: {
		variantId: string;
	}): Promise<VariantAttribute[]> {
		return this.items.filter(
			(item) => item.productVariantId === variantId,
		);
	}

	async findByAttributeId({
		attributeId,
	}: {
		attributeId: string;
	}): Promise<VariantAttribute[]> {
		return this.items.filter((item) => item.attributeId === attributeId);
	}

	async delete({
		variantId,
		attributeId,
	}: DeleteVariantAttributeParams): Promise<void> {
		const index = this.items.findIndex(
			(item) =>
				item.productVariantId === variantId &&
				item.attributeId === attributeId,
		);

		if (index >= 0) {
			this.items.splice(index, 1);
		}
	}
}

