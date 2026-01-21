import type { AttributeValue } from "~/database/schema";
import type { AttributesValuesRepository } from "~/repositories/attributes-values-repository";

interface FindAttributeValuesByAttributeIdUseCaseRequest {
	attributeId: string;
}

interface FindAttributeValuesByAttributeIdUseCaseResponse {
	attributeValues: AttributeValue[];
}

export class FindAttributeValuesByAttributeIdUseCase {
	constructor(
		private readonly attributesValuesRepository: AttributesValuesRepository,
	) {}

	async execute({
		attributeId,
	}: FindAttributeValuesByAttributeIdUseCaseRequest): Promise<FindAttributeValuesByAttributeIdUseCaseResponse> {
		const attributeValues =
			await this.attributesValuesRepository.findByAttributeId({
				attributeId,
			});

		return { attributeValues };
	}
}

