import { DrizzleORM } from "~/database/connection";
import { DrizzleStockRepository } from "~/repositories/drizzle/stock-repository";
import { DeleteStockUseCase } from "~/use-cases/stock/delete-stock";

export function makeDeleteStockUseCase() {
	const stockRepository = new DrizzleStockRepository(DrizzleORM);
	const useCase = new DeleteStockUseCase(stockRepository);

	return useCase;
}

