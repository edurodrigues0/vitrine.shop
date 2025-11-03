import { DrizzleORM } from "~/database/connection";
import { DrizzleProductsRepository } from "~/repositories/drizzle/products-repository";
import { DeleteProductUseCase } from "~/use-cases/products/delete-product";

export function makeDeleteProductUseCase() {
	const productsRepository = new DrizzleProductsRepository(DrizzleORM);
	return new DeleteProductUseCase(productsRepository);
}
