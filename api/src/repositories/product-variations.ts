import type { ProductVariation } from "~/database/schema";

export interface CreateProductVariationParams {
	productId: string;
	size: string;
	color: string;
	weight: string | null;
	dimensions: Record<string, unknown> | null;
	discountPrice: number | null;
	price: number;
	stock: number;
}

export interface UpdateProductVariationParams {
	id: string;
	data: {
		size?: string;
		color?: string;
		weight?: string;
		dimensions?: Record<string, unknown>;
		discountPrice?: number;
		price?: number;
		stock?: number;
	};
}

export interface ProductVariationsRepository {
	create({
		productId,
		size,
		color,
		weight,
		dimensions,
		discountPrice,
		price,
		stock,
	}: CreateProductVariationParams): Promise<ProductVariation | null>;

	findById({ id }: { id: string }): Promise<ProductVariation | null>;

	findByProductId({
		productId,
	}: {
		productId: string;
	}): Promise<ProductVariation[]>;

	update({
		id,
		data,
	}: UpdateProductVariationParams): Promise<ProductVariation | null>;

	delete({ id }: { id: string }): Promise<void>;
}
