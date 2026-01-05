import type { Pagination } from "~/@types/pagination";
import type { Product } from "~/database/schema";

export interface CreateProductParams {
	name: string;
	description?: string | null;
	categoryId: string;
	storeId: string;
	price?: number;
	quantity?: number;
	color?: string;
}

export interface FindAllProductsParams {
	page: number;
	limit: number;
	filters: {
		name?: string;
		description?: string;
		categorySlug?: string;
		storeId?: string;
		latitude?: number;
		longitude?: number;
	};
}

export interface UpdateProductParams {
	id: string;
	data: {
		name?: string;
		description?: string;
		price?: number;
		quantity?: number;
		categoryId?: string;
		color?: string;
	};
}

export interface ProductsRespository {
	create({
		name,
		description,
		categoryId,
		storeId,
		price,
		quantity,
		color,
	}: CreateProductParams): Promise<Product>;

	findById({ id }: { id: string }): Promise<Product | null>;

	findByStoreId({ storeId }: { storeId: string }): Promise<Product[]>;

	findByCategoryId({ categoryId }: { categoryId: string }): Promise<Product[]>;

	countByStoreId({ storeId }: { storeId: string }): Promise<number>;

	findAll({ page, limit, filters }: FindAllProductsParams): Promise<{
		products: (Product & { storeSlug: string; citySlug: string; imageUrl?: string | null })[];
		pagination: Pagination;
	}>;

	update({ id, data }: UpdateProductParams): Promise<Product | null>;

	delete({ id }: { id: string }): Promise<void>;
}
