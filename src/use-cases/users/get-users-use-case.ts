import type * as schema from "~/database/schema";
import type { UsersRepository } from "~/repositories/users-repository";

interface GetUsersUseCaseRequest {
	page: number;
	limit: number;
	filters: {
		name?: string;
		email?: string;
		role?: schema.UserRole;
	};
}

interface GetUsersUseCaseResponse {
	users: {
		id: string;
		name: string;
		email: string;
		role: schema.UserRole;
		createdAt: Date;
		updatedAt: Date;
	}[];
	pagination: {
		totalItems: number;
		totalPages: number;
		currentPage: number;
		perPage: number;
	};
}

export class GetUsersUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute({
		page,
		limit,
		filters,
	}: GetUsersUseCaseRequest): Promise<GetUsersUseCaseResponse> {
		const data = await this.usersRepository.findAll({ page, limit, filters });

		return {
			users: data.users,
			pagination: data.pagination,
		};
	}
}
