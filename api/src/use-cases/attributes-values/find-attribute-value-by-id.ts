import type { AttributeValue } from "~/database/schema";
import type { AttributesValuesRepository } from "~/repositories/attributes-values-repository";
import { AttributeValueNotFoundError } from "../@errors/attributes-values/attribute-value-not-found-error";

interface FindAttributeValueByIdUseCaseRequest {
	id: string;
}

interface FindAttributeValueByIdUseCaseResponse {
	attributeValue: AttributeValue;
}

export class FindAttributeValueByIdUseCase {
	constructor(
		private readonly attributesValuesRepository: AttributesValuesRepository,
	) {}

	async execute({
		id,
	}: FindAttributeValueByIdUseCaseRequest): Promise<FindAttributeValueByIdUseCaseResponse> {
		const attributeValue = await this.attributesValuesRepository.findById({
			id,
		});

		if (!attributeValue) {
			throw new AttributeValueNotFoundError();
		}

		return { attributeValue };
	}
}

