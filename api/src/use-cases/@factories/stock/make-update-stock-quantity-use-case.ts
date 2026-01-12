import { DrizzleORM } from "~/database/connection";
import { DrizzleStockRepository } from "~/repositories/drizzle/stock-repository";
import { UpdateStockQuantityUseCase } from "~/use-cases/stock/update-stock-quantity";

export function makeUpdateStockQuantityUseCase() {
	const stockRepository = new DrizzleStockRepository(DrizzleORM);
	const useCase = new UpdateStockQuantityUseCase(stockRepository);

	return useCase;
}

