import { DrizzleORM } from "~/database/connection";
import { DrizzleAttributesValuesRepository } from "~/repositories/drizzle/attributes-values-repository";
import { FindAttributeValuesByAttributeIdUseCase } from "~/use-cases/attributes-values/find-attribute-values-by-attribute-id";

export function makeFindAttributeValuesByAttributeIdUseCase() {
	const attributesValuesRepository = new DrizzleAttributesValuesRepository(
		DrizzleORM,
	);
	const useCase = new FindAttributeValuesByAttributeIdUseCase(
		attributesValuesRepository,
	);

	return useCase;
}

