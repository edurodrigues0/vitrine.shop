import { DrizzleORM } from "~/database/connection";
import { DrizzleProductVariationsRepository } from "~/repositories/drizzle/product-variations";
import { DrizzleProductsRepository } from "~/repositories/drizzle/products-repository";
import { FindProductVariationsByProductIdUseCase } from "~/use-cases/products-variations/find-product-variations-by-product-id-use-case";

export function makeFindProductVariationsByProductIdUseCase() {
	const productVariationsRepository = new DrizzleProductVariationsRepository(
		DrizzleORM,
	);
	const productsRepository = new DrizzleProductsRepository(DrizzleORM);
	return new FindProductVariationsByProductIdUseCase(
		productVariationsRepository,
		productsRepository,
	);
}
