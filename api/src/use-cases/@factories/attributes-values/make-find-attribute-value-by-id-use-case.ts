import { DrizzleORM } from "~/database/connection";
import { DrizzleAttributesValuesRepository } from "~/repositories/drizzle/attributes-values-repository";
import { FindAttributeValueByIdUseCase } from "~/use-cases/attributes-values/find-attribute-value-by-id";

export function makeFindAttributeValueByIdUseCase() {
	const attributesValuesRepository = new DrizzleAttributesValuesRepository(
		DrizzleORM,
	);
	const useCase = new FindAttributeValueByIdUseCase(attributesValuesRepository);

	return useCase;
}

