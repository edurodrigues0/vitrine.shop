import { DrizzleORM } from "~/database/connection";
import { DrizzleAttributesRepository } from "~/repositories/drizzle/attributes-repository";
import { DrizzleProductVariationsRepository } from "~/repositories/drizzle/product-variations";
import { DrizzleVariantAttributesRepository } from "~/repositories/drizzle/variant-attributes-repository";
import { CreateVariantAttributeUseCase } from "~/use-cases/variant-attributes/create-variant-attribute";

export function makeCreateVariantAttributeUseCase() {
	const variantAttributesRepository = new DrizzleVariantAttributesRepository(
		DrizzleORM,
	);
	const productVariationsRepository = new DrizzleProductVariationsRepository(
		DrizzleORM,
	);
	const attributesRepository = new DrizzleAttributesRepository(DrizzleORM);
	const useCase = new CreateVariantAttributeUseCase(
		variantAttributesRepository,
		productVariationsRepository,
		attributesRepository,
	);

	return useCase;
}

