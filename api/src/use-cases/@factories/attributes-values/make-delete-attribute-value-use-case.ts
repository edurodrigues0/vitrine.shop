import { DrizzleORM } from "~/database/connection";
import { DrizzleAttributesValuesRepository } from "~/repositories/drizzle/attributes-values-repository";
import { DeleteAttributeValueUseCase } from "~/use-cases/attributes-values/delete-attribute-value";

export function makeDeleteAttributeValueUseCase() {
	const attributesValuesRepository = new DrizzleAttributesValuesRepository(
		DrizzleORM,
	);
	const useCase = new DeleteAttributeValueUseCase(attributesValuesRepository);

	return useCase;
}

