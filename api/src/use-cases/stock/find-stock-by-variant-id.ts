import type { Stock } from "~/database/schema";
import type { ProductVariationsRepository } from "~/repositories/product-variations";
import type { StockRepository } from "~/repositories/stock-repository";
import { ProductVariationNotFoundError } from "../@errors/product-variations/product-variation-not-found-error";
import { StockNotFoundError } from "../@errors/stock/stock-not-found-error";

interface FindStockByVariantIdUseCaseRequest {
	variantId: string;
}

interface FindStockByVariantIdUseCaseResponse {
	stock: Stock;
}

export class FindStockByVariantIdUseCase {
	constructor(
		private readonly stockRepository: StockRepository,
		private readonly productVariationsRepository: ProductVariationsRepository,
	) {}

	async execute({
		variantId,
	}: FindStockByVariantIdUseCaseRequest): Promise<FindStockByVariantIdUseCaseResponse> {
		const variant = await this.productVariationsRepository.findById({
			id: variantId,
		});

		if (!variant) {
			throw new ProductVariationNotFoundError();
		}

		const stock = await this.stockRepository.findByVariantId({ variantId });

		if (!stock) {
			throw new StockNotFoundError();
		}

		return { stock };
	}
}

