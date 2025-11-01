import { DrizzleORM } from "~/database/connection";
import { DrizzleProductVariationsRepository } from "~/repositories/drizzle/product-variations";
import { DrizzleProductsRepository } from "~/repositories/drizzle/products-repository";
import { CreateProductVariationUseCase } from "~/use-cases/products-variations/create-product-variation-use-case";

export function makeCreateProductVariationUseCase() {
	const productVariationsRepository = new DrizzleProductVariationsRepository(
		DrizzleORM,
	);
	const productsRepository = new DrizzleProductsRepository(DrizzleORM);
	return new CreateProductVariationUseCase(
		productVariationsRepository,
		productsRepository,
	);
}
