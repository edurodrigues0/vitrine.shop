import type * as schema from "~/database/schema";

export interface CreateUserParams {
	name: string;
	email: string;
	password: string;
	role: schema.UserRole;
}

export interface FindAllUsersParams {
	page: number;
	limit: number;
	filters: {
		name?: string;
		email?: string;
		role?: schema.UserRole;
	};
}

export interface UpdateUserParams {
	id: string;
	name?: string;
	email?: string;
	password?: string;
	role?: schema.UserRole;
}

export interface UsersRepository {
	create({
		name,
		email,
		password,
		role,
	}: CreateUserParams): Promise<typeof schema.users.$inferSelect>;

	findByEmail({
		email,
	}: {
		email: string;
	}): Promise<typeof schema.users.$inferSelect | null>;

	findById({
		id,
	}: {
		id: string;
	}): Promise<typeof schema.users.$inferSelect | null>;

	findAll({ page, limit, filters }: FindAllUsersParams): Promise<{
		users: schema.User[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}>;

	update({
		id,
		name,
		email,
		password,
		role,
	}: UpdateUserParams): Promise<typeof schema.users.$inferSelect | null>;

	delete({ id }: { id: string }): Promise<void>;
}
