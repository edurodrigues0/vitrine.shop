import { and, count, desc, eq, ilike, sql } from "drizzle-orm";
import type { DrizzleORM } from "~/database/connection";
import { type StoreBranch, storeBranches } from "~/database/schema";
import type {
	CreateStoreBranchParams,
	FindAllStoreBranchesParams,
	StoreBranchesRepository,
	UpdateStoreBranchParams,
} from "../store-branches-repository";

export class DrizzleStoreBranchesRepository implements StoreBranchesRepository {
	constructor(private readonly drizzle: typeof DrizzleORM) {}

	async create({
		parentStoreId,
		name,
		cityId,
		whatsapp,
		description,
		isMain = false,
	}: CreateStoreBranchParams): Promise<{ branch: StoreBranch }> {
		const [branch] = await this.drizzle
			.insert(storeBranches)
			.values({
				parentStoreId,
				name,
				cityId,
				whatsapp,
				description,
				isMain,
			})
			.returning();

		if (!branch) {
			throw new Error("Failed to create store branch");
		}

		return { branch };
	}

	async findById({ id }: { id: string }): Promise<StoreBranch | null> {
		const [branch] = await this.drizzle
			.select()
			.from(storeBranches)
			.where(eq(storeBranches.id, id))
			.limit(1);

		return branch ?? null;
	}

	async findByStoreId({ storeId }: { storeId: string }): Promise<StoreBranch[]> {
		return await this.drizzle
			.select()
			.from(storeBranches)
			.where(eq(storeBranches.parentStoreId, storeId))
			.orderBy(desc(storeBranches.createdAt));
	}

	async findByCityId({
		storeId,
		cityId,
	}: {
		storeId: string;
		cityId: string;
	}): Promise<StoreBranch[]> {
		return await this.drizzle
			.select()
			.from(storeBranches)
			.where(
				and(
					eq(storeBranches.parentStoreId, storeId),
					eq(storeBranches.cityId, cityId),
				),
			)
			.orderBy(desc(storeBranches.createdAt));
	}

	async findAll({
		page,
		limit,
		filters,
	}: FindAllStoreBranchesParams): Promise<{
		branches: StoreBranch[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}> {
		const conditions = [];

		if (filters.parentStoreId) {
			conditions.push(eq(storeBranches.parentStoreId, filters.parentStoreId));
		}

		if (filters.cityId) {
			conditions.push(eq(storeBranches.cityId, filters.cityId));
		}

		if (filters.name) {
			conditions.push(ilike(storeBranches.name, `%${filters.name}%`));
		}

		if (filters.isMain !== undefined) {
			conditions.push(eq(storeBranches.isMain, filters.isMain));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		// Contar total de itens
		const [totalResult] = await this.drizzle
			.select({ count: count() })
			.from(storeBranches)
			.where(whereClause);

		const totalItems = totalResult?.count ?? 0;
		const totalPages = Math.ceil(totalItems / limit);
		const offset = (page - 1) * limit;

		// Buscar branches com paginação
		const branches = await this.drizzle
			.select()
			.from(storeBranches)
			.where(whereClause)
			.orderBy(desc(storeBranches.createdAt))
			.limit(limit)
			.offset(offset);

		return {
			branches,
			pagination: {
				totalItems,
				totalPages,
				currentPage: page,
				perPage: limit,
			},
		};
	}

	async update({
		id,
		data,
	}: UpdateStoreBranchParams): Promise<StoreBranch | null> {
		const [branch] = await this.drizzle
			.update(storeBranches)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(storeBranches.id, id))
			.returning();

		return branch ?? null;
	}

	async delete({ id }: { id: string }): Promise<void> {
		await this.drizzle.delete(storeBranches).where(eq(storeBranches.id, id));
	}
}

