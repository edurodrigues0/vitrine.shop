import { DrizzleORM } from "~/database/connection";
import { DrizzleProductVariationsRepository } from "~/repositories/drizzle/product-variations";
import { DeleteProductVariationUseCase } from "~/use-cases/products-variations/delete-product-variation-use-case";

export function makeDeleteProductVariationUseCase() {
	const productVariationsRepository = new DrizzleProductVariationsRepository(
		DrizzleORM,
	);
	return new DeleteProductVariationUseCase(productVariationsRepository);
}
