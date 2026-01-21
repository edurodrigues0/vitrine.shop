import type { AttributeValue } from "~/database/schema";
import type { AttributesRepository } from "~/repositories/attributes-repository";
import type { AttributesValuesRepository } from "~/repositories/attributes-values-repository";
import { AttributeNotFoundError } from "../@errors/attributes/attribute-not-found-error";
import { AttributeValueAlreadyExistsError } from "../@errors/attributes-values/attribute-value-already-exists-error";
import { FailedToCreateAttributeValueError } from "../@errors/attributes-values/failed-to-create-attribute-value-error";

interface CreateAttributeValueUseCaseRequest {
	attributeId: string;
	value: string;
}

interface CreateAttributeValueUseCaseResponse {
	attributeValue: AttributeValue;
}

export class CreateAttributeValueUseCase {
	constructor(
		private readonly attributesValuesRepository: AttributesValuesRepository,
		private readonly attributesRepository: AttributesRepository,
	) {}

	async execute({
		attributeId,
		value,
	}: CreateAttributeValueUseCaseRequest): Promise<CreateAttributeValueUseCaseResponse> {
		const attribute = await this.attributesRepository.findById({
			id: attributeId,
		});

		if (!attribute) {
			throw new AttributeNotFoundError();
		}

		const existingValue =
			await this.attributesValuesRepository.findByAttributeIdAndValue({
				attributeId,
				value,
			});

		if (existingValue) {
			throw new AttributeValueAlreadyExistsError();
		}

		try {
			const attributeValue = await this.attributesValuesRepository.create({
				attributeId,
				value,
			});

			return { attributeValue };
		} catch (error) {
			throw new FailedToCreateAttributeValueError();
		}
	}
}

