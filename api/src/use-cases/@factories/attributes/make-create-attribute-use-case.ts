import { DrizzleORM } from "~/database/connection";
import { DrizzleAttributesRepository } from "~/repositories/drizzle/attributes-repository";
import { CreateAttributeUseCase } from "~/use-cases/attributes/create-attribute";

export function makeCreateAttributeUseCase() {
	const attributesRepository = new DrizzleAttributesRepository(DrizzleORM);
	const useCase = new CreateAttributeUseCase(attributesRepository);

	return useCase;
}

