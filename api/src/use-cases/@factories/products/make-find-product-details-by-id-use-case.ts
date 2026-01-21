import { DrizzleORM } from "~/database/connection";
import { DrizzleAttributesRepository } from "~/repositories/drizzle/attributes-repository";
import { DrizzleAttributesValuesRepository } from "~/repositories/drizzle/attributes-values-repository";
import { DrizzleProductImagesRepository } from "~/repositories/drizzle/product-images";
import { DrizzleProductsRepository } from "~/repositories/drizzle/products-repository";
import { DrizzleProductVariationsRepository } from "~/repositories/drizzle/product-variations";
import { DrizzleStockRepository } from "~/repositories/drizzle/stock-repository";
import { DrizzleVariantAttributesRepository } from "~/repositories/drizzle/variant-attributes-repository";
import { FindProductDetailsByIdUseCase } from "~/use-cases/products/find-product-details-by-id";

export function makeFindProductDetailsByIdUseCase() {
	const productsRepository = new DrizzleProductsRepository(DrizzleORM);
	const productVariationsRepository = new DrizzleProductVariationsRepository(
		DrizzleORM,
	);
	const stockRepository = new DrizzleStockRepository(DrizzleORM);
	const productImagesRepository = new DrizzleProductImagesRepository(DrizzleORM);
	const variantAttributesRepository = new DrizzleVariantAttributesRepository(
		DrizzleORM,
	);
	const attributesRepository = new DrizzleAttributesRepository(DrizzleORM);
	const attributesValuesRepository = new DrizzleAttributesValuesRepository(
		DrizzleORM,
	);

	return new FindProductDetailsByIdUseCase(
		productsRepository,
		productVariationsRepository,
		stockRepository,
		productImagesRepository,
		variantAttributesRepository,
		attributesRepository,
		attributesValuesRepository,
	);
}

