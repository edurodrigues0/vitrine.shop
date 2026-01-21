import { DrizzleORM } from "~/database/connection";
import { DrizzleProductVariationsRepository } from "~/repositories/drizzle/product-variations";
import { DrizzleVariantAttributesRepository } from "~/repositories/drizzle/variant-attributes-repository";
import { FindVariantAttributesByVariantIdUseCase } from "~/use-cases/variant-attributes/find-variant-attributes-by-variant-id";

export function makeFindVariantAttributesByVariantIdUseCase() {
	const variantAttributesRepository = new DrizzleVariantAttributesRepository(
		DrizzleORM,
	);
	const productVariationsRepository = new DrizzleProductVariationsRepository(
		DrizzleORM,
	);
	const useCase = new FindVariantAttributesByVariantIdUseCase(
		variantAttributesRepository,
		productVariationsRepository,
	);

	return useCase;
}

