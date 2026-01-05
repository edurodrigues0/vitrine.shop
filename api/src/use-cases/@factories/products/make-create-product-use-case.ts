import { DrizzleORM } from "~/database/connection";
import { DrizzleProductsRepository } from "~/repositories/drizzle/products-repository";
import { DrizzleStoresRepository } from "~/repositories/drizzle/stores-repository";
import { DrizzleSubscriptionsRepository } from "~/repositories/drizzle/subscriptions-repository";
import { CreateProductUseCase } from "~/use-cases/products/create-product";

export function makeCreateProductUseCase() {
	const productsRepository = new DrizzleProductsRepository(DrizzleORM);
	const storesRepository = new DrizzleStoresRepository(DrizzleORM);
	const subscriptionsRepository = new DrizzleSubscriptionsRepository(DrizzleORM);
	return new CreateProductUseCase(
		productsRepository,
		storesRepository,
		subscriptionsRepository,
	);
}
