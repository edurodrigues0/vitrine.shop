import type { Stock } from "~/database/schema";
import type { ProductVariationsRepository } from "~/repositories/product-variations";
import type { StockRepository } from "~/repositories/stock-repository";
import { ProductVariationNotFoundError } from "../@errors/product-variations/product-variation-not-found-error";
import { FailedToCreateStockError } from "../@errors/stock/failed-to-create-stock-error";

interface CreateStockUseCaseRequest {
	variantId: string;
	quantity: number;
}

interface CreateStockUseCaseResponse {
	stock: Stock;
}

export class CreateStockUseCase {
	constructor(
		private readonly stockRepository: StockRepository,
		private readonly productVariationsRepository: ProductVariationsRepository,
	) {}

	async execute({
		variantId,
		quantity,
	}: CreateStockUseCaseRequest): Promise<CreateStockUseCaseResponse> {
		const variant = await this.productVariationsRepository.findById({
			id: variantId,
		});

		if (!variant) {
			throw new ProductVariationNotFoundError();
		}

		if (quantity < 0) {
			throw new Error("Quantity cannot be negative");
		}

		try {
			const stock = await this.stockRepository.create({
				variantId,
				quantity,
			});

			return { stock };
		} catch (error) {
			throw new FailedToCreateStockError();
		}
	}
}

