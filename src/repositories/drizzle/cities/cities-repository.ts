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

		// Construir condições WHERE de forma mais eficiente
		const whereConditions = [
			...(name ? [ilike(cities.name, `%${name}%`)] : []),
			...(state ? [eq(cities.state, state)] : []),
		];

		const whereClause =
			whereConditions.length > 0 ? and(...whereConditions) : undefined;

		// Executar contagem e busca em paralelo para melhor performance
		const [countResult, citiesResult] = await Promise.all([
			this.drizzle
				.select({ count: sql<number>`count(*)` })
				.from(cities)
				.where(whereClause),
			this.drizzle
				.select()
				.from(cities)
				.where(whereClause)
				.limit(limit)
				.offset((page - 1) * limit)
				.orderBy(cities.name), // Adicionar ordenação consistente
		]);

		const totalItems = Number(countResult[0]?.count ?? 0);
		const totalPages = Math.ceil(totalItems / limit);

		return {
			cities: citiesResult,
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
