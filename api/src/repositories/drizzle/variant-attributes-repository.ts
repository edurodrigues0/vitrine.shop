import { and, eq } from "drizzle-orm";
import type { DrizzleORM } from "~/database/connection";
import {
	type VariantAttribute,
	variantAttributes,
} from "~/database/schema";
import type {
	CreateVariantAttributeParams,
	DeleteVariantAttributeParams,
	VariantAttributesRepository,
} from "../variant-attributes-repository";

export class DrizzleVariantAttributesRepository
	implements VariantAttributesRepository
{
	constructor(private readonly drizzle: typeof DrizzleORM) {}

	async create({
		productVariantId,
		attributeId,
	}: CreateVariantAttributeParams): Promise<VariantAttribute> {
		const [variantAttribute] = await this.drizzle
			.insert(variantAttributes)
			.values({ productVariantId, attributeId })
			.returning();

		if (!variantAttribute) {
			throw new Error("Failed to create variant attribute");
		}

		return variantAttribute;
	}

	async findByVariantId({
		variantId,
	}: {
		variantId: string;
	}): Promise<VariantAttribute[]> {
		const attributes = await this.drizzle
			.select()
			.from(variantAttributes)
			.where(eq(variantAttributes.productVariantId, variantId));

		return attributes;
	}

	async findByAttributeId({
		attributeId,
	}: {
		attributeId: string;
	}): Promise<VariantAttribute[]> {
		const attributes = await this.drizzle
			.select()
			.from(variantAttributes)
			.where(eq(variantAttributes.attributeId, attributeId));

		return attributes;
	}

	async delete({
		variantId,
		attributeId,
	}: DeleteVariantAttributeParams): Promise<void> {
		await this.drizzle
			.delete(variantAttributes)
			.where(
				and(
					eq(variantAttributes.productVariantId, variantId),
					eq(variantAttributes.attributeId, attributeId),
				),
			);
	}
}

