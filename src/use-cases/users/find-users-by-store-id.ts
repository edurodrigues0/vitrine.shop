import type * as schema from "~/database/schema";
import type { UsersRepository } from "~/repositories/users-repository";

interface FindUserByStoreIdUseCaseRequest {
	storeId: string;
	page: number;
	limit: number;
	filters: {
		email?: string;
		name?: string;
		role?: schema.UserRole;
	};
}

interface FindUserByStoreIdUseCaseResponse {
	users: schema.User[];
	pagination: {
		totalItems: number;
		totalPages: number;
		currentPage: number;
		perPage: number;
	};
}

export class FindUserByStoreIdUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute({
		storeId,
		page,
		limit,
		filters,
	}: FindUserByStoreIdUseCaseRequest): Promise<FindUserByStoreIdUseCaseResponse> {
		const { users, pagination } = await this.usersRepository.findByStoreId({
			storeId,
			page,
			limit,
			filters,
		});

		return { users, pagination };
	}
}
