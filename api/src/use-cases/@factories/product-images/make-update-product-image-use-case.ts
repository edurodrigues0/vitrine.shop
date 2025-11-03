import { DrizzleORM } from "~/database/connection";
import { DrizzleProductImagesRepository } from "~/repositories/drizzle/product-images";
import { UpdateProductImageUseCase } from "~/use-cases/product-images/update-product-image-use-case";

export function makeUpdateProductImageUseCase() {
	const productImagesRepository = new DrizzleProductImagesRepository(
		DrizzleORM,
	);
	return new UpdateProductImageUseCase(productImagesRepository);
}
