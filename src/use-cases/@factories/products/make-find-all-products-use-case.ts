import { DrizzleORM } from "~/database/connection";
import { DrizzleProductsRepository } from "~/repositories/drizzle/products-repository";
import { FindAllProductsUseCase } from "~/use-cases/products/find-all-products";

export function makeFindAllProductsUseCase() {
	const productsRepository = new DrizzleProductsRepository(DrizzleORM);
	return new FindAllProductsUseCase(productsRepository);
}
