import { DrizzleORM } from "~/database/connection";
import { DrizzleProductVariationsRepository } from "~/repositories/drizzle/product-variations";
import { DrizzleStockRepository } from "~/repositories/drizzle/stock-repository";
import { CreateStockUseCase } from "~/use-cases/stock/create-stock";

export function makeCreateStockUseCase() {
	const stockRepository = new DrizzleStockRepository(DrizzleORM);
	const productVariationsRepository = new DrizzleProductVariationsRepository(
		DrizzleORM,
	);
	const useCase = new CreateStockUseCase(
		stockRepository,
		productVariationsRepository,
	);

	return useCase;
}

