import type { User, UserRole } from "~/database/schema";
import type {
	CreateUserParams,
	FindAllUsersParams,
	FindByStoreIdParams,
	UpdateUserParams,
	UsersRepository,
} from "../users-repository";

export class InMemoryUsersRepository implements UsersRepository {
	public items: User[] = [];

	async create({
		name,
		email,
		password,
		role,
		storeId,
	}: CreateUserParams): Promise<User> {
		const id = crypto.randomUUID();
		const createdAt = new Date();

		const user: User = {
			id,
			name,
			email,
			passwordHash: password,
			role: role ?? "OWNER",
			storeId: storeId ?? null,
			createdAt,
		};

		this.items.push(user);
		return user;
	}

	async findByEmail({ email }: { email: string }): Promise<User | null> {
		return this.items.find((item) => item.email === email) ?? null;
	}

	async findById({ id }: { id: string }): Promise<User | null> {
		return this.items.find((item) => item.id === id) ?? null;
	}

	async findAll({ page, limit, filters }: FindAllUsersParams): Promise<{
		users: User[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}> {
		const { email, name, role } = filters;

		let users = this.items;

		if (email) {
			users = users.filter((item) =>
				item.email.toLocaleLowerCase().includes(email.toLocaleLowerCase()),
			);
		}

		if (name) {
			users = users.filter((item) =>
				item.name.toLocaleLowerCase().includes(name.toLocaleLowerCase()),
			);
		}

		if (role) {
			users = users.filter((item) => item.role === role);
		}

		const totalItems = users.length;
		const totalPages = Math.ceil(totalItems / limit);
		const paginatedUsers = users.slice((page - 1) * limit, page * limit);

		return {
			users: paginatedUsers,
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
		page,
		limit,
		filters,
	}: FindByStoreIdParams): Promise<{
		users: User[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}> {
		const { email, name, role } = filters;

		let users = this.items.filter((item) => item.storeId === storeId);

		if (email) {
			users = users.filter((item) =>
				item.email.toLocaleLowerCase().includes(email.toLocaleLowerCase()),
			);
		}

		if (name) {
			users = users.filter((item) =>
				item.name.toLocaleLowerCase().includes(name.toLocaleLowerCase()),
			);
		}

		if (role) {
			users = users.filter((item) => item.role === role);
		}

		const totalItems = users.length;
		const totalPages = Math.ceil(totalItems / limit);
		const paginatedUsers = users.slice((page - 1) * limit, page * limit);

		return {
			users: paginatedUsers,
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
		const userIndex = this.items.findIndex((item) => item.id === id);

		if (userIndex < 0) {
			return null;
		}

		const currentUser = this.items[userIndex];

		const updatedUser: User = {
			...currentUser,
			name: name ?? currentUser?.name,
			email: email ?? currentUser?.email,
			passwordHash: password ?? currentUser?.passwordHash,
			role: role ?? currentUser?.role,
		} as User;

		this.items[userIndex] = updatedUser;
		return updatedUser;
	}

	async delete({ id }: { id: string }): Promise<void> {
		const userIndex = this.items.findIndex((item) => item.id === id);
		if (userIndex > -1) {
			this.items.splice(userIndex, 1);
		}
	}
}
