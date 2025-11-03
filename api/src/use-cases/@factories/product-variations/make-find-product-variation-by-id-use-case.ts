import { DrizzleORM } from "~/database/connection";
import { DrizzleProductVariationsRepository } from "~/repositories/drizzle/product-variations";
import { FindProductVariationByIdUseCase } from "~/use-cases/products-variations/find-product-variation-by-id";

export function makeFindProductVariationByIdUseCase() {
	const productVariationsRepository = new DrizzleProductVariationsRepository(
		DrizzleORM,
	);
	return new FindProductVariationByIdUseCase(productVariationsRepository);
}
