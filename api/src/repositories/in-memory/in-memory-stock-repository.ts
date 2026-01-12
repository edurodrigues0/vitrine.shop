import type { Stock } from "~/database/schema";
import type {
	CreateStockParams,
	StockRepository,
	UpdateStockByVariantIdParams,
	UpdateStockParams,
} from "../stock-repository";

export class InMemoryStockRepository implements StockRepository {
	public items: Stock[] = [];

	async create({ variantId, quantity }: CreateStockParams): Promise<Stock> {
		const id = crypto.randomUUID();

		const stock: Stock = {
			id,
			variantId,
			quantity,
			updatedAt: new Date(),
		};

		this.items.push(stock);
		return stock;
	}

	async findById({ id }: { id: string }): Promise<Stock | null> {
		return this.items.find((item) => item.id === id) ?? null;
	}

	async findByVariantId({
		variantId,
	}: {
		variantId: string;
	}): Promise<Stock | null> {
		return this.items.find((item) => item.variantId === variantId) ?? null;
	}

	async update({ id, data }: UpdateStockParams): Promise<Stock | null> {
		const stockIndex = this.items.findIndex((item) => item.id === id);

		if (stockIndex < 0) {
			return null;
		}

		const currentStock = this.items[stockIndex];

		if (!currentStock) {
			return null;
		}

		const updatedStock: Stock = {
			...currentStock,
			quantity: data.quantity ?? currentStock.quantity,
			updatedAt: new Date(),
		};

		this.items[stockIndex] = updatedStock;
		return updatedStock;
	}

	async updateByVariantId({
		variantId,
		quantity,
	}: UpdateStockByVariantIdParams): Promise<Stock | null> {
		const stockIndex = this.items.findIndex(
			(item) => item.variantId === variantId,
		);

		if (stockIndex < 0) {
			return null;
		}

		const currentStock = this.items[stockIndex];

		if (!currentStock) {
			return null;
		}

		const updatedStock: Stock = {
			...currentStock,
			quantity,
			updatedAt: new Date(),
		};

		this.items[stockIndex] = updatedStock;
		return updatedStock;
	}

	async delete({ id }: { id: string }): Promise<void> {
		const stockIndex = this.items.findIndex((item) => item.id === id);
		if (stockIndex >= 0) {
			this.items.splice(stockIndex, 1);
		}
	}
}

