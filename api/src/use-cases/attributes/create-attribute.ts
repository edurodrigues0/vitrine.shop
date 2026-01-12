import type { Attribute } from "~/database/schema";
import type { AttributesRepository } from "~/repositories/attributes-repository";
import { AttributeAlreadyExistsError } from "../@errors/attributes/attribute-already-exists-error";
import { FailedToCreateAttributeError } from "../@errors/attributes/failed-to-create-attribute-error";

interface CreateAttributeUseCaseRequest {
	name: string;
}

interface CreateAttributeUseCaseResponse {
	attribute: Attribute;
}

export class CreateAttributeUseCase {
	constructor(private readonly attributesRepository: AttributesRepository) {}

	async execute({
		name,
	}: CreateAttributeUseCaseRequest): Promise<CreateAttributeUseCaseResponse> {
		const attributeWithSameName = await this.attributesRepository.findByName({
			name,
		});

		if (attributeWithSameName) {
			throw new AttributeAlreadyExistsError();
		}

		try {
			const attribute = await this.attributesRepository.create({ name });
			return { attribute };
		} catch (error) {
			throw new FailedToCreateAttributeError();
		}
	}
}

