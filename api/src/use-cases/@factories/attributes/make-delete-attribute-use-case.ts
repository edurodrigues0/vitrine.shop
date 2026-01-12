import { DrizzleORM } from "~/database/connection";
import { DrizzleAttributesRepository } from "~/repositories/drizzle/attributes-repository";
import { DeleteAttributeUseCase } from "~/use-cases/attributes/delete-attribute";

export function makeDeleteAttributeUseCase() {
	const attributesRepository = new DrizzleAttributesRepository(DrizzleORM);
	const useCase = new DeleteAttributeUseCase(attributesRepository);

	return useCase;
}

