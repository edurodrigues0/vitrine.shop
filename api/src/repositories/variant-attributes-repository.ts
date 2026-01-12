import type { VariantAttribute } from "~/database/schema";

export interface CreateVariantAttributeParams {
	productVariantId: string;
	attributeId: string;
}

export interface DeleteVariantAttributeParams {
	variantId: string;
	attributeId: string;
}

export interface VariantAttributesRepository {
	create({
		productVariantId,
		attributeId,
	}: CreateVariantAttributeParams): Promise<VariantAttribute>;

	findByVariantId({
		variantId,
	}: {
		variantId: string;
	}): Promise<VariantAttribute[]>;

	findByAttributeId({
		attributeId,
	}: {
		attributeId: string;
	}): Promise<VariantAttribute[]>;

	delete({
		variantId,
		attributeId,
	}: DeleteVariantAttributeParams): Promise<void>;
}

