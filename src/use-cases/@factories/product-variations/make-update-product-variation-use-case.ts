import { DrizzleORM } from "~/database/connection";
import { DrizzleProductVariationsRepository } from "~/repositories/drizzle/product-variations";
import { UpdateProductVariationUseCase } from "~/use-cases/products-variations/update-product-variation-use-case";

export function makeUpdateProductVariationUseCase() {
	const productVariationsRepository = new DrizzleProductVariationsRepository(
		DrizzleORM,
	);
	return new UpdateProductVariationUseCase(productVariationsRepository);
}
