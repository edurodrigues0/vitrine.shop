import { DrizzleORM } from "~/database/connection";
import { DrizzleProductImagesRepository } from "~/repositories/drizzle/product-images";
import { DrizzleProductVariationsRepository } from "~/repositories/drizzle/product-variations";
import { CreateProductImageUseCase } from "~/use-cases/product-images/create-product-image-use-case";

export function makeCreateProductImageUseCase() {
	const productImagesRepository = new DrizzleProductImagesRepository(
		DrizzleORM,
	);
	const productVariationsRepository = new DrizzleProductVariationsRepository(
		DrizzleORM,
	);
	return new CreateProductImageUseCase(
		productImagesRepository,
		productVariationsRepository,
	);
}
