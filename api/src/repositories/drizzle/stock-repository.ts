import { eq } from "drizzle-orm";
import type { DrizzleORM } from "~/database/connection";
import { type Stock, stocks } from "~/database/schema";
import type {
	CreateStockParams,
	StockRepository,
	UpdateStockByVariantIdParams,
	UpdateStockParams,
} from "../stock-repository";

export class DrizzleStockRepository implements StockRepository {
	constructor(private readonly drizzle: typeof DrizzleORM) {}

	async create({ variantId, quantity }: CreateStockParams): Promise<Stock> {
		const [stock] = await this.drizzle
			.insert(stocks)
			.values({ variantId, quantity })
			.returning();

		if (!stock) {
			throw new Error("Failed to create stock");
		}

		return stock;
	}

	async findById({ id }: { id: string }): Promise<Stock | null> {
		const [stock] = await this.drizzle
			.select()
			.from(stocks)
			.where(eq(stocks.id, id))
			.limit(1);

		return stock ?? null;
	}

	async findByVariantId({
		variantId,
	}: {
		variantId: string;
	}): Promise<Stock | null> {
		const [stock] = await this.drizzle
			.select()
			.from(stocks)
			.where(eq(stocks.variantId, variantId))
			.limit(1);

		return stock ?? null;
	}

	async update({ id, data }: UpdateStockParams): Promise<Stock | null> {
		const updateData: { quantity?: number; updatedAt: Date } = {
			updatedAt: new Date(),
		};

		if (data.quantity !== undefined) {
			updateData.quantity = data.quantity;
		}

		const [stock] = await this.drizzle
			.update(stocks)
			.set(updateData)
			.where(eq(stocks.id, id))
			.returning();

		return stock ?? null;
	}

	async updateByVariantId({
		variantId,
		quantity,
	}: UpdateStockByVariantIdParams): Promise<Stock | null> {
		const [stock] = await this.drizzle
			.update(stocks)
			.set({ quantity, updatedAt: new Date() })
			.where(eq(stocks.variantId, variantId))
			.returning();

		return stock ?? null;
	}

	async delete({ id }: { id: string }): Promise<void> {
		await this.drizzle.delete(stocks).where(eq(stocks.id, id));
	}
}

