import { and, eq, ilike, sql } from "drizzle-orm";
import type { DrizzleORM } from "~/database/connection";
import { type User, type UserRole, users } from "~/database/schema";
import type {
	CreateUserParams,
	FindAllUsersParams,
	FindByStoreIdParams,
	UpdateUserParams,
	UsersRepository,
} from "../users-repository";

export class DrizzleUsersRepository implements UsersRepository {
	constructor(private readonly drizzle: typeof DrizzleORM) {}

	async create({
		name,
		email,
		password,
		role,
		storeId,
	}: CreateUserParams): Promise<User> {
		const [user] = await this.drizzle
			.insert(users)
			.values({
				name,
				email,
				passwordHash: password,
				role: role ?? "OWNER",
				storeId: storeId ?? null,
			})
			.returning();

		if (!user) {
			throw new Error("Failed to create user");
		}

		return user;
	}

	async findByEmail({ email }: { email: string }): Promise<User | null> {
		const [user] = await this.drizzle
			.select()
			.from(users)
			.where(eq(users.email, email));

		return user ?? null;
	}

	async findById({ id }: { id: string }): Promise<User | null> {
		const [user] = await this.drizzle
			.select()
			.from(users)
			.where(eq(users.id, id));

		return user ?? null;
	}

	async findAll({
		page = 1,
		limit = 10,
		filters = {},
	}: FindAllUsersParams): Promise<{
		users: User[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}> {
		const { name, email, role } = filters;

		const whereConditions = [
			...(name ? [ilike(users.name, `%${name}%`)] : []),
			...(email ? [ilike(users.email, `%${email}%`)] : []),
			...(role ? [eq(users.role, role)] : []),
		];

		const whereClause =
			whereConditions.length > 0 ? and(...whereConditions) : undefined;

		const [countResult, usersResult] = await Promise.all([
			this.drizzle
				.select({ count: sql<number>`count(*)` })
				.from(users)
				.where(whereClause),
			this.drizzle
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
					role: users.role,
					storeId: users.storeId,
					createdAt: users.createdAt,
				})
				.from(users)
				.where(whereClause)
				.limit(limit)
				.offset((page - 1) * limit)
				.orderBy(users.name),
		]);

		const totalItems = Number(countResult[0]?.count ?? 0);
		const totalPages = Math.ceil(totalItems / limit);

		return {
			users: usersResult as User[],
			pagination: {
				totalItems,
				totalPages,
				currentPage: page,
				perPage: limit,
			},
		};
	}

	async findByStoreId({
		storeId,
		page = 1,
		limit = 10,
		filters = {},
	}: FindByStoreIdParams): Promise<{
		users: User[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}> {
		const { name, email, role } = filters;

		const whereConditions = [
			eq(users.storeId, storeId),
			...(name ? [ilike(users.name, `%${name}%`)] : []),
			...(email ? [ilike(users.email, `%${email}%`)] : []),
			...(role ? [eq(users.role, role)] : []),
		];

		const whereClause = and(...whereConditions);

		const [countResult, usersResult] = await Promise.all([
			this.drizzle
				.select({ count: sql<number>`count(*)` })
				.from(users)
				.where(whereClause),
			this.drizzle
				.select({
					id: users.id,
					name: users.name,
					email: users.email,
					role: users.role,
					storeId: users.storeId,
					createdAt: users.createdAt,
				})
				.from(users)
				.where(whereClause)
				.limit(limit)
				.offset((page - 1) * limit)
				.orderBy(users.name),
		]);

		const totalItems = Number(countResult[0]?.count ?? 0);
		const totalPages = Math.ceil(totalItems / limit);

		return {
			users: usersResult as User[],
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
		name,
		email,
		password,
		role,
	}: UpdateUserParams): Promise<User | null> {
		const updateData: Partial<{
			name: string;
			email: string;
			passwordHash: string;
			role: UserRole;
		}> = {};

		if (name !== undefined) updateData.name = name;
		if (email !== undefined) updateData.email = email;
		if (password !== undefined) updateData.passwordHash = password;
		if (role !== undefined) updateData.role = role;

		const [user] = await this.drizzle
			.update(users)
			.set(updateData)
			.where(eq(users.id, id))
			.returning();

		return user ?? null;
	}

	async delete({ id }: { id: string }): Promise<void> {
		await this.drizzle.delete(users).where(eq(users.id, id));
	}
}
