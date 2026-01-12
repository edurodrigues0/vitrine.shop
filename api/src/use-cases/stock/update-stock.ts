import type { Stock } from "~/database/schema";
import type { StockRepository } from "~/repositories/stock-repository";
import { StockNotFoundError } from "../@errors/stock/stock-not-found-error";
import { FailedToUpdateStockError } from "../@errors/stock/failed-to-update-stock-error";

interface UpdateStockUseCaseRequest {
	id: string;
	data: {
		quantity?: number;
	};
}

interface UpdateStockUseCaseResponse {
	stock: Stock;
}

export class UpdateStockUseCase {
	constructor(private readonly stockRepository: StockRepository) {}

	async execute({
		id,
		data,
	}: UpdateStockUseCaseRequest): Promise<UpdateStockUseCaseResponse> {
		const stock = await this.stockRepository.findById({ id });

		if (!stock) {
			throw new StockNotFoundError();
		}

		if (data.quantity !== undefined && data.quantity < 0) {
			throw new Error("Quantity cannot be negative");
		}

		const updatedStock = await this.stockRepository.update({
			id,
			data,
		});

		if (!updatedStock) {
			throw new FailedToUpdateStockError();
		}

		return { stock: updatedStock };
	}
}

