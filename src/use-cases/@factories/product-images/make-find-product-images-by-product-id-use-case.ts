import { DrizzleORM } from "~/database/connection";
import { DrizzleProductImagesRepository } from "~/repositories/drizzle/product-images";
import { DrizzleProductsRepository } from "~/repositories/drizzle/products-repository";
import { FindProductImagesByProductIdUseCase } from "~/use-cases/product-images/find-product-images-by-product-id";

export function makeFindProductImagesByProductIdUseCase() {
	const productImagesRepository = new DrizzleProductImagesRepository(
		DrizzleORM,
	);
	const productsRepository = new DrizzleProductsRepository(DrizzleORM);
	return new FindProductImagesByProductIdUseCase(
		productImagesRepository,
		productsRepository,
	);
}
