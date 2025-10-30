import { DrizzleORM } from "~/database/connection";
import { DrizzleProductsRepository } from "~/repositories/drizzle/products-repository";
import { CreateProductUseCase } from "~/use-cases/products/create-product";

export function makeCreateProductUseCase() {
	const productsRepository = new DrizzleProductsRepository(DrizzleORM);
	return new CreateProductUseCase(productsRepository);
}
