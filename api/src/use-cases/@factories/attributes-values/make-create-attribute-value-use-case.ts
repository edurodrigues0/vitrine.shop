import { DrizzleORM } from "~/database/connection";
import { DrizzleAttributesRepository } from "~/repositories/drizzle/attributes-repository";
import { DrizzleAttributesValuesRepository } from "~/repositories/drizzle/attributes-values-repository";
import { CreateAttributeValueUseCase } from "~/use-cases/attributes-values/create-attribute-value";

export function makeCreateAttributeValueUseCase() {
	const attributesValuesRepository = new DrizzleAttributesValuesRepository(
		DrizzleORM,
	);
	const attributesRepository = new DrizzleAttributesRepository(DrizzleORM);
	const useCase = new CreateAttributeValueUseCase(
		attributesValuesRepository,
		attributesRepository,
	);

	return useCase;
}

