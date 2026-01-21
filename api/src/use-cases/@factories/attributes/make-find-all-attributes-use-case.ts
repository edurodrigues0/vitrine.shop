import { DrizzleORM } from "~/database/connection";
import { DrizzleAttributesRepository } from "~/repositories/drizzle/attributes-repository";
import { FindAllAttributesUseCase } from "~/use-cases/attributes/find-all-attributes";

export function makeFindAllAttributesUseCase() {
	const attributesRepository = new DrizzleAttributesRepository(DrizzleORM);
	const useCase = new FindAllAttributesUseCase(attributesRepository);

	return useCase;
}

