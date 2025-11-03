import type { Pagination } from "~/@types/pagination";
import type { Category } from "~/database/schema";
import type {
	CategoriesRespository,
	FindAllCategoriesParams,
	UpdateCategoryParams,
} from "../categories-repository";

export class InMemoryCategoriesRepository implements CategoriesRespository {
	public items: Category[] = [];

	async create({
		name,
		slug,
	}: {
		name: string;
		slug: string;
	}): Promise<{ category: Category }> {
		const id = crypto.randomUUID();

		const category: Category = {
			id,
			name,
			slug,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.items.push(category);
		return { category };
	}

	async findBySlug({ slug }: { slug: string }): Promise<Category | null> {
		return this.items.find((item) => item.slug === slug) ?? null;
	}

	async findById({ id }: { id: string }): Promise<Category | null> {
		return this.items.find((item) => item.id === id) ?? null;
	}

	async findAll({ page, limit, filters }: FindAllCategoriesParams): Promise<{
		categories: Category[];
		pagination: Pagination;
	}> {
		const { name, slug } = filters;
		let categories = this.items;

		if (name) {
			categories = categories.filter((item) =>
				item.name.toLowerCase().includes(name.toLowerCase()),
			);
		}

		if (slug) {
			categories = categories.filter((item) =>
				item.slug.toLowerCase().includes(slug.toLowerCase()),
			);
		}

		const totalItems = categories.length;
		const totalPages = Math.ceil(totalItems / limit);
		const paginatedCategories = categories.slice(
			(page - 1) * limit,
			page * limit,
		);

		return {
			categories: paginatedCategories,
			pagination: {
				totalItems,
				totalPages,
				perPage: limit,
				currentPage: page,
			},
		};
	}

	async update({ id, data }: UpdateCategoryParams): Promise<Category | null> {
		const categoryIndex = this.items.findIndex((item) => item.id === id);

		if (categoryIndex < 0) {
			return null;
		}

		const currentCategory = this.items[categoryIndex];

		if (!currentCategory) {
			return null;
		}

		const updatedCategory: Category = {
			...currentCategory,
			name: data.name ?? currentCategory.name,
			slug: data.slug ?? currentCategory.slug,
			updatedAt: new Date(),
		};

		this.items[categoryIndex] = updatedCategory;
		return updatedCategory;
	}

	async delete({ id }: { id: string }): Promise<void> {
		const categoryIndex = this.items.findIndex((item) => item.id === id);
		if (categoryIndex >= 0) {
			this.items.splice(categoryIndex, 1);
		}
	}
}
