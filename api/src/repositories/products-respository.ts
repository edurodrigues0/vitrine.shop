import type { Pagination } from "~/@types/pagination";
import type { Product } from "~/database/schema";

export interface CreateProductParams {
	name: string;
	description?: string | null;
	categoryId: string;
	storeId: string;
}

export interface FindAllProductsParams {
	page: number;
	limit: number;
	filters: {
		name?: string;
		description?: string;
		categorySlug?: string;
		storeId?: string;
	};
}

export interface UpdateProductParams {
	id: string;
	data: {
		name?: string;
		description?: string;
	};
}

export interface ProductsRespository {
	create({
		name,
		description,
		categoryId,
		storeId,
	}: CreateProductParams): Promise<Product>;

	findById({ id }: { id: string }): Promise<Product | null>;

	findByStoreId({ storeId }: { storeId: string }): Promise<Product[]>;

	findByCategoryId({ categoryId }: { categoryId: string }): Promise<Product[]>;

	findAll({ page, limit, filters }: FindAllProductsParams): Promise<{
		products: Product[];
		pagination: Pagination;
	}>;

	update({ id, data }: UpdateProductParams): Promise<Product | null>;

	delete({ id }: { id: string }): Promise<void>;
}
