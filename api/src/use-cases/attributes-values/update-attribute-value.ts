import type { AttributeValue } from "~/database/schema";
import type { AttributesValuesRepository } from "~/repositories/attributes-values-repository";
import { AttributeValueNotFoundError } from "../@errors/attributes-values/attribute-value-not-found-error";
import { FailedToUpdateAttributeValueError } from "../@errors/attributes-values/failed-to-update-attribute-value-error";

interface UpdateAttributeValueUseCaseRequest {
	id: string;
	data: {
		value?: string;
	};
}

interface UpdateAttributeValueUseCaseResponse {
	attributeValue: AttributeValue;
}

export class UpdateAttributeValueUseCase {
	constructor(
		private readonly attributesValuesRepository: AttributesValuesRepository,
	) {}

	async execute({
		id,
		data,
	}: UpdateAttributeValueUseCaseRequest): Promise<UpdateAttributeValueUseCaseResponse> {
		const attributeValue = await this.attributesValuesRepository.findById({
			id,
		});

		if (!attributeValue) {
			throw new AttributeValueNotFoundError();
		}

		const updatedAttributeValue =
			await this.attributesValuesRepository.update({
				id,
				data,
			});

		if (!updatedAttributeValue) {
			throw new FailedToUpdateAttributeValueError();
		}

		return { attributeValue: updatedAttributeValue };
	}
}

