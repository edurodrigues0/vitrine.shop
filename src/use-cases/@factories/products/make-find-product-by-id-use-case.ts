import { DrizzleORM } from "~/database/connection";
import { DrizzleProductsRepository } from "~/repositories/drizzle/products-repository";
import { FindProductByIdUseCase } from "~/use-cases/products/find-product-by-id";

export function makeFindProductByIdUseCase() {
	const productsRepository = new DrizzleProductsRepository(DrizzleORM);
	return new FindProductByIdUseCase(productsRepository);
}
