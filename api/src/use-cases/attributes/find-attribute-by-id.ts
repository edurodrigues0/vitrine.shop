import type { Attribute } from "~/database/schema";
import type { AttributesRepository } from "~/repositories/attributes-repository";
import { AttributeNotFoundError } from "../@errors/attributes/attribute-not-found-error";

interface FindAttributeByIdUseCaseRequest {
	id: string;
}

interface FindAttributeByIdUseCaseResponse {
	attribute: Attribute;
}

export class FindAttributeByIdUseCase {
	constructor(private readonly attributesRepository: AttributesRepository) {}

	async execute({
		id,
	}: FindAttributeByIdUseCaseRequest): Promise<FindAttributeByIdUseCaseResponse> {
		const attribute = await this.attributesRepository.findById({ id });

		if (!attribute) {
			throw new AttributeNotFoundError();
		}

		return { attribute };
	}
}

