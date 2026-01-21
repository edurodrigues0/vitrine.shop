import type { AttributeValue } from "~/database/schema";

export interface CreateAttributeValueParams {
	attributeId: string;
	value: string;
}

export interface UpdateAttributeValueParams {
	id: string;
	data: {
		value?: string;
	};
}

export interface AttributesValuesRepository {
	create({
		attributeId,
		value,
	}: CreateAttributeValueParams): Promise<AttributeValue>;

	findById({ id }: { id: string }): Promise<AttributeValue | null>;

	findByAttributeId({
		attributeId,
	}: {
		attributeId: string;
	}): Promise<AttributeValue[]>;

	findByAttributeIdAndValue({
		attributeId,
		value,
	}: {
		attributeId: string;
		value: string;
	}): Promise<AttributeValue | null>;

	update({
		id,
		data,
	}: UpdateAttributeValueParams): Promise<AttributeValue | null>;

	delete({ id }: { id: string }): Promise<void>;
}

