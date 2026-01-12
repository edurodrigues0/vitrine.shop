import { DrizzleORM } from "~/database/connection";
import { DrizzleAttributesRepository } from "~/repositories/drizzle/attributes-repository";
import { FindAttributeByIdUseCase } from "~/use-cases/attributes/find-attribute-by-id";

export function makeFindAttributeByIdUseCase() {
	const attributesRepository = new DrizzleAttributesRepository(DrizzleORM);
	const useCase = new FindAttributeByIdUseCase(attributesRepository);

	return useCase;
}

