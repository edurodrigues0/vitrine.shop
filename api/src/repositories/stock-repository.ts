import type { Stock } from "~/database/schema";

export interface CreateStockParams {
	variantId: string;
	quantity: number;
}

export interface UpdateStockParams {
	id: string;
	data: {
		quantity?: number;
	};
}

export interface UpdateStockByVariantIdParams {
	variantId: string;
	quantity: number;
}

export interface StockRepository {
	create({ variantId, quantity }: CreateStockParams): Promise<Stock>;

	findById({ id }: { id: string }): Promise<Stock | null>;

	findByVariantId({ variantId }: { variantId: string }): Promise<Stock | null>;

	update({ id, data }: UpdateStockParams): Promise<Stock | null>;

	updateByVariantId({
		variantId,
		quantity,
	}: UpdateStockByVariantIdParams): Promise<Stock | null>;

	delete({ id }: { id: string }): Promise<void>;
}

