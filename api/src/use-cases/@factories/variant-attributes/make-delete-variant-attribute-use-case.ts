import { DrizzleORM } from "~/database/connection";
import { DrizzleProductVariationsRepository } from "~/repositories/drizzle/product-variations";
import { DrizzleVariantAttributesRepository } from "~/repositories/drizzle/variant-attributes-repository";
import { DeleteVariantAttributeUseCase } from "~/use-cases/variant-attributes/delete-variant-attribute";

export function makeDeleteVariantAttributeUseCase() {
	const variantAttributesRepository = new DrizzleVariantAttributesRepository(
		DrizzleORM,
	);
	const productVariationsRepository = new DrizzleProductVariationsRepository(
		DrizzleORM,
	);
	const useCase = new DeleteVariantAttributeUseCase(
		variantAttributesRepository,
		productVariationsRepository,
	);

	return useCase;
}

