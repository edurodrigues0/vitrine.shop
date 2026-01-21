import type { StockRepository } from "~/repositories/stock-repository";
import { StockNotFoundError } from "../@errors/stock/stock-not-found-error";

interface DeleteStockUseCaseRequest {
	id: string;
}

export class DeleteStockUseCase {
	constructor(private readonly stockRepository: StockRepository) {}

	async execute({ id }: DeleteStockUseCaseRequest): Promise<void> {
		const stock = await this.stockRepository.findById({ id });

		if (!stock) {
			throw new StockNotFoundError();
		}

		await this.stockRepository.delete({ id });
	}
}

