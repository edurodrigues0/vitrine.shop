import { DrizzleORM } from "~/database/connection";
import { DrizzleProductImagesRepository } from "~/repositories/drizzle/product-images";
import { FindProductImagesByProductVariationIdUseCase } from "~/use-cases/product-images/find-product-images-by-product-id";

export function makeFindProductImagesByProductVariationIdUseCase() {
	const productImagesRepository = new DrizzleProductImagesRepository(
		DrizzleORM,
	);
	return new FindProductImagesByProductVariationIdUseCase(
		productImagesRepository,
	);
}
