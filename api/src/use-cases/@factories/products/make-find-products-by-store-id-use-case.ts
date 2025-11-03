import { DrizzleORM } from "~/database/connection";
import { DrizzleProductsRepository } from "~/repositories/drizzle/products-repository";
import { FindProductsByStoreIdUseCase } from "~/use-cases/products/find-products-by-store-id";

export function makeFindProductsByStoreIdUseCase() {
	const productsRepository = new DrizzleProductsRepository(DrizzleORM);
	return new FindProductsByStoreIdUseCase(productsRepository);
}
