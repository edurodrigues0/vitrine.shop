import { DrizzleORM } from "~/database/connection";
import { DrizzleProductsRepository } from "~/repositories/drizzle/products-repository";
import { UpdateProductUseCase } from "~/use-cases/products/update-product";

export function makeUpdateProductUseCase() {
	const productsRepository = new DrizzleProductsRepository(DrizzleORM);
	return new UpdateProductUseCase(productsRepository);
}
