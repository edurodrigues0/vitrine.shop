import { DrizzleORM } from "~/database/connection";
import { DrizzleProductVariationsRepository } from "~/repositories/drizzle/product-variations";
import { DrizzleStockRepository } from "~/repositories/drizzle/stock-repository";
import { FindStockByVariantIdUseCase } from "~/use-cases/stock/find-stock-by-variant-id";

export function makeFindStockByVariantIdUseCase() {
	const stockRepository = new DrizzleStockRepository(DrizzleORM);
	const productVariationsRepository = new DrizzleProductVariationsRepository(
		DrizzleORM,
	);
	const useCase = new FindStockByVariantIdUseCase(
		stockRepository,
		productVariationsRepository,
	);

	return useCase;
}

