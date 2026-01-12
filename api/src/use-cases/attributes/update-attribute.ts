import type { Attribute } from "~/database/schema";
import type { AttributesRepository } from "~/repositories/attributes-repository";
import { AttributeNotFoundError } from "../@errors/attributes/attribute-not-found-error";
import { FailedToUpdateAttributeError } from "../@errors/attributes/failed-to-update-attribute-error";

interface UpdateAttributeUseCaseRequest {
	id: string;
	data: {
		name?: string;
	};
}

interface UpdateAttributeUseCaseResponse {
	attribute: Attribute;
}

export class UpdateAttributeUseCase {
	constructor(private readonly attributesRepository: AttributesRepository) {}

	async execute({
		id,
		data,
	}: UpdateAttributeUseCaseRequest): Promise<UpdateAttributeUseCaseResponse> {
		const attribute = await this.attributesRepository.findById({ id });

		if (!attribute) {
			throw new AttributeNotFoundError();
		}

		const updatedAttribute = await this.attributesRepository.update({
			id,
			data,
		});

		if (!updatedAttribute) {
			throw new FailedToUpdateAttributeError();
		}

		return { attribute: updatedAttribute };
	}
}

