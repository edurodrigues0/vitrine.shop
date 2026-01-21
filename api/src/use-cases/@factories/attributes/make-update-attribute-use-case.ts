import { DrizzleORM } from "~/database/connection";
import { DrizzleAttributesRepository } from "~/repositories/drizzle/attributes-repository";
import { UpdateAttributeUseCase } from "~/use-cases/attributes/update-attribute";

export function makeUpdateAttributeUseCase() {
	const attributesRepository = new DrizzleAttributesRepository(DrizzleORM);
	const useCase = new UpdateAttributeUseCase(attributesRepository);

	return useCase;
}

