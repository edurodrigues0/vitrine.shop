import { and, eq, ilike, sql } from "drizzle-orm";
import type { DrizzleORM } from "~/database/connection";
import { type City, cities } from "~/database/schema";
import type {
	CitiesRepository,
	CreateCityParams,
	FindAllCitiesParams,
	UpdateCityParams,
} from "~/repositories/cities-repository";

export class DrizzleCitiesRepository implements CitiesRepository {
	constructor(private readonly drizzle: typeof DrizzleORM) {}

	async create({ name, state }: CreateCityParams): Promise<{ city: City }> {
		const [city] = await this.drizzle
			.insert(cities)
			.values({ name, state })
			.returning();

		if (!city) {
			throw new Error("Failed to create city");
		}

		return { city };
	}

	async findByNameAndState({
		name,
		state,
	}: {
		name: string;
		state: string;
	}): Promise<City | null> {
		const [city] = await this.drizzle
			.select()
			.from(cities)
			.where(and(eq(cities.name, name), eq(cities.state, state)));

		return city ?? null;
	}

	async findAll({
		page = 1,
		limit = 10,
		filters = {},
	}: FindAllCitiesParams): Promise<{
		cities: (typeof cities.$inferSelect)[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}> {
		const { name, state } = filters;

		const whereConditions = [];

		if (name) {
			whereConditions.push(ilike(cities.name, `%${name}%`));
		}

		if (state) {
			whereConditions.push(eq(cities.state, state));
		}

		const whereClause =
			whereConditions.length > 0 ? and(...whereConditions) : undefined;

		const [count] = await this.drizzle
			.select({ count: sql<number>`count(*)` })
			.from(cities)
			.where(whereClause);

		const totalItems = Number(count);
		const totalPages = Math.ceil(totalItems / limit);
		const offset = (page - 1) * limit;

		const result = await this.drizzle
			.select()
			.from(cities)
			.where(whereClause)
			.limit(limit)
			.offset(offset);

		return {
			cities: result,
			pagination: {
				totalItems,
				totalPages,
				currentPage: page,
				perPage: limit,
			},
		};
	}

	async update({ id, data }: UpdateCityParams): Promise<City | null> {
		const [city] = await this.drizzle
			.update(cities)
			.set(data)
			.where(eq(cities.id, id))
			.returning();

		return city ?? null;
	}
}
