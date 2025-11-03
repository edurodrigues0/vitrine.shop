import type { User } from "~/database/schema";
import type { UsersRepository } from "~/repositories/users-repository";

interface FindAllUsersUseCaseRequest {
	page: number;
	limit: number;
	filters: {
		name?: string;
		email?: string;
		role?: "ADMIN" | "OWNER" | "EMPLOYEE";
	};
}

interface FindAllUsersUseCaseResponse {
	users: User[];
	pagination: {
		totalItems: number;
		totalPages: number;
		currentPage: number;
		perPage: number;
	};
}

export class FindAllUsersUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute({
		page,
		limit,
		filters,
	}: FindAllUsersUseCaseRequest): Promise<FindAllUsersUseCaseResponse> {
		const { users, pagination } = await this.usersRepository.findAll({
			page,
			limit,
			filters,
		});

		return { users, pagination };
	}
}
