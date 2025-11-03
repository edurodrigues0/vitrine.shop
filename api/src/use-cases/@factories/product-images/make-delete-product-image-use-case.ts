import { DrizzleORM } from "~/database/connection";
import { DrizzleProductImagesRepository } from "~/repositories/drizzle/product-images";
import { DeleteProductImageUseCase } from "~/use-cases/product-images/delete-product-image-use-cae";

export function makeDeleteProductImageUseCase() {
	const productImagesRepository = new DrizzleProductImagesRepository(
		DrizzleORM,
	);
	return new DeleteProductImageUseCase(productImagesRepository);
}
