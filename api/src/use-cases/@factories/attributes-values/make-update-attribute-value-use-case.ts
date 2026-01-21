import { DrizzleORM } from "~/database/connection";
import { DrizzleAttributesValuesRepository } from "~/repositories/drizzle/attributes-values-repository";
import { UpdateAttributeValueUseCase } from "~/use-cases/attributes-values/update-attribute-value";

export function makeUpdateAttributeValueUseCase() {
	const attributesValuesRepository = new DrizzleAttributesValuesRepository(
		DrizzleORM,
	);
	const useCase = new UpdateAttributeValueUseCase(attributesValuesRepository);

	return useCase;
}

