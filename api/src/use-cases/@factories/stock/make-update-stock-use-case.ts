import { DrizzleORM } from "~/database/connection";
import { DrizzleStockRepository } from "~/repositories/drizzle/stock-repository";
import { UpdateStockUseCase } from "~/use-cases/stock/update-stock";

export function makeUpdateStockUseCase() {
	const stockRepository = new DrizzleStockRepository(DrizzleORM);
	const useCase = new UpdateStockUseCase(stockRepository);

	return useCase;
}

