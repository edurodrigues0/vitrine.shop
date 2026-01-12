import type { AttributesRepository } from "~/repositories/attributes-repository";
import { AttributeNotFoundError } from "../@errors/attributes/attribute-not-found-error";

interface DeleteAttributeUseCaseRequest {
	id: string;
}

export class DeleteAttributeUseCase {
	constructor(private readonly attributesRepository: AttributesRepository) {}

	async execute({ id }: DeleteAttributeUseCaseRequest): Promise<void> {
		const attribute = await this.attributesRepository.findById({ id });

		if (!attribute) {
			throw new AttributeNotFoundError();
		}

		await this.attributesRepository.delete({ id });
	}
}

