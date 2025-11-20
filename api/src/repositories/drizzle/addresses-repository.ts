import { and, count, eq, ilike, or, sql } from "drizzle-orm";
import type { DrizzleORM } from "~/database/connection";
import { addresses, cities, type Address } from "~/database/schema";
import type {
	AddressesRepository,
	CreateAddressParams,
	FindAllAddressesParams,
	UpdateAddressParams,
} from "../addresses-repository";

export class DrizzleAddressesRepository implements AddressesRepository {
	constructor(private readonly drizzle: typeof DrizzleORM) {}

	async create({
		street,
		number,
		complement,
		neighborhood,
		cityId,
		zipCode,
		country,
		storeId,
		isMain,
	}: CreateAddressParams): Promise<Address> {
		const [address] = await this.drizzle
			.insert(addresses)
			.values({
				street,
				number,
				complement: complement || null,
				neighborhood,
				cityId,
				zipCode,
				country,
				storeId: storeId || null,
				isMain: isMain ?? false,
			})
			.returning();

		if (!address) {
			throw new Error("Failed to create address");
		}

		return address;
	}

	async findById({ id }: { id: string }): Promise<Address | null> {
		const [address] = await this.drizzle
			.select()
			.from(addresses)
			.where(eq(addresses.id, id));

		return address ?? null;
	}

	async findAll({
		page,
		limit,
		filters,
	}: FindAllAddressesParams): Promise<{
		addresses: Address[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}> {
		const {
			street,
			number,
			complement,
			neighborhood,
			zipCode,
			country,
			cityName,
			state,
		} = filters;

		const conditions = [];

		if (street) {
			conditions.push(ilike(addresses.street, `%${street}%`));
		}

		if (number) {
			conditions.push(ilike(addresses.number, `%${number}%`));
		}

		if (complement) {
			conditions.push(ilike(addresses.complement, `%${complement}%`));
		}

		if (neighborhood) {
			conditions.push(ilike(addresses.neighborhood, `%${neighborhood}%`));
		}

		if (zipCode) {
			conditions.push(ilike(addresses.zipCode, `%${zipCode}%`));
		}

		if (country) {
			conditions.push(ilike(addresses.country, `%${country}%`));
		}

		// Se houver filtro por cityName ou state, precisamos fazer join com cities
		if (cityName || state) {
			const cityConditions = [];
			if (cityName) {
				cityConditions.push(ilike(cities.name, `%${cityName}%`));
			}
			if (state) {
				cityConditions.push(eq(cities.state, state));
			}

			if (cityConditions.length > 0) {
				// Buscar cidades que correspondem aos filtros
				const matchingCities = await this.drizzle
					.select({ id: cities.id })
					.from(cities)
					.where(and(...cityConditions));

				const cityIds = matchingCities.map((city) => city.id);

				if (cityIds.length > 0) {
					conditions.push(
						or(...cityIds.map((cityId) => eq(addresses.cityId, cityId))),
					);
				} else {
					// Se não houver cidades correspondentes, retornar vazio
					return {
						addresses: [],
						pagination: {
							totalItems: 0,
							totalPages: 0,
							currentPage: page,
							perPage: limit,
						},
					};
				}
			}
		}

		const whereClause =
			conditions.length > 0 ? and(...conditions) : undefined;

		const offset = (page - 1) * limit;

		// Executar contagem e busca em paralelo
		const [countResult, addressesResult] = await Promise.all([
			this.drizzle
				.select({ count: sql<number>`count(*)` })
				.from(addresses)
				.where(whereClause),
			this.drizzle
				.select()
				.from(addresses)
				.where(whereClause)
				.limit(limit)
				.offset(offset)
				.orderBy(addresses.street),
		]);

		const totalItems = Number(countResult[0]?.count ?? 0);
		const totalPages = Math.ceil(totalItems / limit);

		return {
			addresses: addressesResult,
			pagination: {
				totalItems,
				totalPages,
				currentPage: page,
				perPage: limit,
			},
		};
	}

	async update({ id, data }: UpdateAddressParams): Promise<Address | null> {
		// Preparar dados para atualização, tratando undefined como null para campos opcionais
		const updateData: Record<string, unknown> = {};

		if (data.street !== undefined) updateData.street = data.street;
		if (data.number !== undefined) updateData.number = data.number;
		if (data.complement !== undefined) updateData.complement = data.complement ?? null;
		if (data.neighborhood !== undefined) updateData.neighborhood = data.neighborhood;
		if (data.cityId !== undefined) updateData.cityId = data.cityId;
		if (data.zipCode !== undefined) updateData.zipCode = data.zipCode;
		if (data.country !== undefined) updateData.country = data.country;
		if (data.storeId !== undefined) updateData.storeId = data.storeId ?? null;
		if (data.isMain !== undefined) updateData.isMain = data.isMain;

		const [updatedAddress] = await this.drizzle
			.update(addresses)
			.set(updateData)
			.where(eq(addresses.id, id))
			.returning();

		return updatedAddress ?? null;
	}

	async delete({ id }: { id: string }): Promise<void> {
		await this.drizzle.delete(addresses).where(eq(addresses.id, id));
	}
}

