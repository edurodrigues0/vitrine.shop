import type { NewProductImage, ProductImage } from "~/database/schema";

export interface CreateProductImageParams {
	productId: string;
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
		productId,
		url,
	}: CreateProductImageParams): Promise<ProductImage | null>;

	findById({ id }: { id: string }): Promise<ProductImage | null>;

	findProductImagesByProductId({
		productId,
	}: {
		productId: string;
	}): Promise<ProductImage[]>;

	update({ id, data }: UpdateProductImageParams): Promise<ProductImage | null>;

	delete({ id }: { id: string }): Promise<void>;
}
