import type { Pagination } from "~/@types/pagination";
import type { Category } from "~/database/schema";

interface CreateCategoryParams {
	name: string;
	slug: string;
}

export interface FindAllCategoriesParams {
	page: number;
	limit: number;
	filters: {
		name?: string;
		slug?: string;
	};
}

export interface UpdateCategoryParams {
	id: string;
	data: {
		name?: string;
		slug?: string;
	};
}

export interface CategoriesRespository {
	create({ name, slug }: CreateCategoryParams): Promise<{ category: Category }>;

	findById({ id }: { id: string }): Promise<Category | null>;

	findBySlug({ slug }: { slug: string }): Promise<Category | null>;

	findAll({ page, limit, filters }: FindAllCategoriesParams): Promise<{
		categories: Category[];
		pagination: Pagination;
	}>;

	update({ id, data }: UpdateCategoryParams): Promise<Category | null>;

	delete({ id }: { id: string }): Promise<void>;
}
