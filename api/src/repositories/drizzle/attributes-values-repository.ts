import { and, eq } from "drizzle-orm";
import type { DrizzleORM } from "~/database/connection";
import {
	type AttributeValue,
	attributesValues,
} from "~/database/schema";
import type {
	AttributesValuesRepository,
	CreateAttributeValueParams,
	UpdateAttributeValueParams,
} from "../attributes-values-repository";

export class DrizzleAttributesValuesRepository
	implements AttributesValuesRepository
{
	constructor(private readonly drizzle: typeof DrizzleORM) {}

	async create({
		attributeId,
		value,
	}: CreateAttributeValueParams): Promise<AttributeValue> {
		const [attributeValue] = await this.drizzle
			.insert(attributesValues)
			.values({ attributeId, value })
			.returning();

		if (!attributeValue) {
			throw new Error("Failed to create attribute value");
		}

		return attributeValue;
	}

	async findById({ id }: { id: string }): Promise<AttributeValue | null> {
		const [attributeValue] = await this.drizzle
			.select()
			.from(attributesValues)
			.where(eq(attributesValues.id, id))
			.limit(1);

		return attributeValue ?? null;
	}

	async findByAttributeId({
		attributeId,
	}: {
		attributeId: string;
	}): Promise<AttributeValue[]> {
		const values = await this.drizzle
			.select()
			.from(attributesValues)
			.where(eq(attributesValues.attributeId, attributeId));

		return values;
	}

	async findByAttributeIdAndValue({
		attributeId,
		value,
	}: {
		attributeId: string;
		value: string;
	}): Promise<AttributeValue | null> {
		const [attributeValue] = await this.drizzle
			.select()
			.from(attributesValues)
			.where(
				and(
					eq(attributesValues.attributeId, attributeId),
					eq(attributesValues.value, value),
				),
			)
			.limit(1);

		return attributeValue ?? null;
	}

	async update({
		id,
		data,
	}: UpdateAttributeValueParams): Promise<AttributeValue | null> {
		const updateData: { value?: string; updatedAt: Date } = {
			updatedAt: new Date(),
		};

		if (data.value !== undefined) {
			updateData.value = data.value;
		}

		const [attributeValue] = await this.drizzle
			.update(attributesValues)
			.set(updateData)
			.where(eq(attributesValues.id, id))
			.returning();

		return attributeValue ?? null;
	}

	async delete({ id }: { id: string }): Promise<void> {
		await this.drizzle
			.delete(attributesValues)
			.where(eq(attributesValues.id, id));
	}
}

