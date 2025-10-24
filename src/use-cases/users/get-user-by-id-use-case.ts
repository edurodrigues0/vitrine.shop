import type * as schema from "~/database/schema";
import type { UsersRepository } from "~/repositories/users-repository";

interface GetUserByIdUseCaseRequest {
	id: string;
}

interface GetUserByIdUseCaseResponse {
	user: {
		id: string;
		name: string;
		email: string;
		role: schema.UserRole;
		createdAt: Date;
		updatedAt: Date;
	} | null;
}

export class GetUserByIdUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute({
		id,
	}: GetUserByIdUseCaseRequest): Promise<GetUserByIdUseCaseResponse> {
		const user = await this.usersRepository.findById({ id });

		if (!user) {
			throw new Error("User not found");
		}

		return {
			user: user,
		};
	}
}
