import type { AttributeValue } from "~/database/schema";
import type {
	AttributesValuesRepository,
	CreateAttributeValueParams,
	UpdateAttributeValueParams,
} from "../attributes-values-repository";

export class InMemoryAttributesValuesRepository
	implements AttributesValuesRepository
{
	public items: AttributeValue[] = [];

	async create({
		attributeId,
		value,
	}: CreateAttributeValueParams): Promise<AttributeValue> {
		const id = crypto.randomUUID();

		const attributeValue: AttributeValue = {
			id,
			attributeId,
			value,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.items.push(attributeValue);
		return attributeValue;
	}

	async findById({ id }: { id: string }): Promise<AttributeValue | null> {
		return this.items.find((item) => item.id === id) ?? null;
	}

	async findByAttributeId({
		attributeId,
	}: {
		attributeId: string;
	}): Promise<AttributeValue[]> {
		return this.items.filter((item) => item.attributeId === attributeId);
	}

	async findByAttributeIdAndValue({
		attributeId,
		value,
	}: {
		attributeId: string;
		value: string;
	}): Promise<AttributeValue | null> {
		return (
			this.items.find(
				(item) => item.attributeId === attributeId && item.value === value,
			) ?? null
		);
	}

	async update({
		id,
		data,
	}: UpdateAttributeValueParams): Promise<AttributeValue | null> {
		const attributeValueIndex = this.items.findIndex((item) => item.id === id);

		if (attributeValueIndex < 0) {
			return null;
		}

		const currentAttributeValue = this.items[attributeValueIndex];

		if (!currentAttributeValue) {
			return null;
		}

		const updatedAttributeValue: AttributeValue = {
			...currentAttributeValue,
			value: data.value ?? currentAttributeValue.value,
			updatedAt: new Date(),
		};

		this.items[attributeValueIndex] = updatedAttributeValue;
		return updatedAttributeValue;
	}

	async delete({ id }: { id: string }): Promise<void> {
		const attributeValueIndex = this.items.findIndex((item) => item.id === id);
		if (attributeValueIndex >= 0) {
			this.items.splice(attributeValueIndex, 1);
		}
	}
}

