import type { AttributesValuesRepository } from "~/repositories/attributes-values-repository";
import { AttributeValueNotFoundError } from "../@errors/attributes-values/attribute-value-not-found-error";

interface DeleteAttributeValueUseCaseRequest {
	id: string;
}

export class DeleteAttributeValueUseCase {
	constructor(
		private readonly attributesValuesRepository: AttributesValuesRepository,
	) {}

	async execute({ id }: DeleteAttributeValueUseCaseRequest): Promise<void> {
		const attributeValue = await this.attributesValuesRepository.findById({
			id,
		});

		if (!attributeValue) {
			throw new AttributeValueNotFoundError();
		}

		await this.attributesValuesRepository.delete({ id });
	}
}

