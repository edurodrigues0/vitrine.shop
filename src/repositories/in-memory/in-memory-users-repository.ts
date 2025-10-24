import type { User } from "~/database/schema";
import type {
	CreateUserParams,
	FindAllUsersParams,
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
	}: CreateUserParams): Promise<User> {
		const user: User = {
			id: crypto.randomUUID(),
			name,
			email,
			password,
			role,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		this.items.push(user);
		return user;
	}

	async findByEmail({ email }: { email: string }): Promise<User | null> {
		const user = this.items.find((item) => item.email === email);

		return user || null;
	}

	async findById({ id }: { id: string }): Promise<User | null> {
		const user = this.items.find((item) => item.id === id);

		return user || null;
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
		const { email, name, role } = filters || {};

		let users = this.items;

		if (email) {
			users = users.filter((item) =>
				item.email.toLowerCase().includes(email.toLowerCase()),
			);
		}

		if (name) {
			users = users.filter((item) =>
				item.name.toLowerCase().includes(name.toLowerCase()),
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

		if (!currentUser) {
			return null;
		}

		const updatedUser: User = {
			id: currentUser.id,
			name: name ?? currentUser.name,
			email: email ?? currentUser.email,
			password: password ?? currentUser.password,
			role: role ?? currentUser.role,
			createdAt: currentUser.createdAt,
			updatedAt: new Date(),
		};

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
