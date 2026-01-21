import type { Stock } from "~/database/schema";
import type { StockRepository } from "~/repositories/stock-repository";
import { StockNotFoundError } from "../@errors/stock/stock-not-found-error";
import { FailedToUpdateStockError } from "../@errors/stock/failed-to-update-stock-error";

interface UpdateStockQuantityUseCaseRequest {
	variantId: string;
	quantity: number;
}

interface UpdateStockQuantityUseCaseResponse {
	stock: Stock;
}

export class UpdateStockQuantityUseCase {
	constructor(private readonly stockRepository: StockRepository) {}

	async execute({
		variantId,
		quantity,
	}: UpdateStockQuantityUseCaseRequest): Promise<UpdateStockQuantityUseCaseResponse> {
		if (quantity < 0) {
			throw new Error("Quantity cannot be negative");
		}

		const stock = await this.stockRepository.findByVariantId({ variantId });

		if (!stock) {
			throw new StockNotFoundError();
		}

		const updatedStock = await this.stockRepository.updateByVariantId({
			variantId,
			quantity,
		});

		if (!updatedStock) {
			throw new FailedToUpdateStockError();
		}

		return { stock: updatedStock };
	}
}

