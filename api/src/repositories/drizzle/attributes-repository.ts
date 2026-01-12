import { eq, ilike, sql } from "drizzle-orm";
import type { Pagination } from "~/@types/pagination";
import type { DrizzleORM } from "~/database/connection";
import { type Attribute, attributes } from "~/database/schema";
import type {
	AttributesRepository,
	FindAllAttributesParams,
	UpdateAttributeParams,
} from "../attributes-repository";

export class DrizzleAttributesRepository implements AttributesRepository {
	constructor(private readonly drizzle: typeof DrizzleORM) {}

	async create({ name }: { name: string }): Promise<Attribute> {
		const [attribute] = await this.drizzle
			.insert(attributes)
			.values({ name })
			.returning();

		if (!attribute) {
			throw new Error("Failed to create attribute");
		}

		return attribute;
	}

	async findById({ id }: { id: string }): Promise<Attribute | null> {
		const [attribute] = await this.drizzle
			.select()
			.from(attributes)
			.where(eq(attributes.id, id))
			.limit(1);

		return attribute ?? null;
	}

	async findByName({ name }: { name: string }): Promise<Attribute | null> {
		const [attribute] = await this.drizzle
			.select()
			.from(attributes)
			.where(eq(attributes.name, name))
			.limit(1);

		return attribute ?? null;
	}

	async findAll({ page, limit, filters }: FindAllAttributesParams): Promise<{
		attributes: Attribute[];
		pagination: Pagination;
	}> {
		const { name } = filters;

		const whereClause = name ? ilike(attributes.name, `%${name}%`) : undefined;

		const [countResult, attributesResult] = await Promise.all([
			this.drizzle
				.select({ count: sql<number>`count(*)` })
				.from(attributes)
				.where(whereClause),
			this.drizzle
				.select()
				.from(attributes)
				.where(whereClause)
				.limit(limit)
				.offset((page - 1) * limit)
				.orderBy(attributes.name),
		]);

		const totalItems = Number(countResult[0]?.count ?? 0);
		const totalPages = Math.ceil(totalItems / limit);

		return {
			attributes: attributesResult,
			pagination: {
				totalItems,
				totalPages,
				currentPage: page,
				perPage: limit,
			},
		};
	}

	async update({ id, data }: UpdateAttributeParams): Promise<Attribute | null> {
		const updateData: { name?: string; updatedAt: Date } = {
			updatedAt: new Date(),
		};

		if (data.name !== undefined) {
			updateData.name = data.name;
		}

		const [attribute] = await this.drizzle
			.update(attributes)
			.set(updateData)
			.where(eq(attributes.id, id))
			.returning();

		return attribute ?? null;
	}

	async delete({ id }: { id: string }): Promise<void> {
		await this.drizzle.delete(attributes).where(eq(attributes.id, id));
	}
}

