import type { ProductImage } from "~/database/schema";

export interface CreateProductImageParams {
	productVariationId: string;
	url: string;
}

export interface UpdateProductImageParams {
	id: string;
	data: {
		url?: string;
	};
}

export interface ProductImagesRepository {
	create({
		productVariationId,
		url,
	}: CreateProductImageParams): Promise<ProductImage | null>;

	findById({ id }: { id: string }): Promise<ProductImage | null>;

	findProductImagesByProductId({
		productVariationId,
	}: {
		productVariationId: string;
	}): Promise<ProductImage[]>;

	update({ id, data }: UpdateProductImageParams): Promise<ProductImage | null>;

	delete({ id }: { id: string }): Promise<void>;
}
