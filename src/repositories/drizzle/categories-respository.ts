import { eq, ilike, sql } from "drizzle-orm";
import type { Pagination } from "~/@types/pagination";
import type { DrizzleORM } from "~/database/connection";
import { type Category, categories } from "~/database/schema";
import type {
	CategoriesRespository,
	FindAllCategoriesParams,
	UpdateCategoryParams,
} from "../categories-repository";

export class DrizzleCategoriesRepository implements CategoriesRespository {
	constructor(private readonly drizzle: typeof DrizzleORM) {}

	async create({
		name,
		slug,
	}: {
		name: string;
		slug: string;
	}): Promise<{ category: Category }> {
		const [category] = await this.drizzle
			.insert(categories)
			.values({ name, slug })
			.returning();

		if (!category) {
			throw new Error("Failed to create category");
		}

		return { category };
	}

	async findById({ id }: { id: string }): Promise<Category | null> {
		const [category] = await this.drizzle
			.select()
			.from(categories)
			.where(eq(categories.id, id))
			.limit(1);

		return category ?? null;
	}

	async findBySlug({ slug }: { slug: string }): Promise<Category | null> {
		const [category] = await this.drizzle
			.select()
			.from(categories)
			.where(eq(categories.slug, slug))
			.limit(1);

		return category ?? null;
	}

	async findAll({ page, limit, filters }: FindAllCategoriesParams): Promise<{
		categories: Category[];
		pagination: Pagination;
	}> {
		const { name } = filters;

		const whereClause = name ? ilike(categories.name, `%${name}%`) : undefined;

		const [countResult, categoriesResult] = await Promise.all([
			this.drizzle
				.select({ count: sql<number>`count(*)` })
				.from(categories)
				.where(whereClause),
			this.drizzle
				.select()
				.from(categories)
				.where(whereClause)
				.limit(limit)
				.offset((page - 1) * limit)
				.orderBy(categories.name),
		]);

		const totalItems = Number(countResult[0]?.count ?? 0);
		const totalPages = Math.ceil(totalItems / limit);

		return {
			categories: categoriesResult,
			pagination: {
				totalItems,
				totalPages,
				currentPage: page,
				perPage: limit,
			},
		};
	}

	async update({ id, data }: UpdateCategoryParams): Promise<Category | null> {
		const [category] = await this.drizzle
			.update(categories)
			.set(data)
			.where(eq(categories.id, id))
			.returning();

		return category ?? null;
	}

	async delete({ id }: { id: string }): Promise<void> {
		await this.drizzle.delete(categories).where(eq(categories.id, id));
	}
}
