import type * as schema from "~/database/schema";
import type { UsersRepository } from "~/repositories/users-repository";

interface GetUserByEmailUseCaseRequest {
	email: string;
}

interface GetUserByEmailUseCaseResponse {
	user: {
		id: string;
		name: string;
		email: string;
		role: schema.UserRole;
		createdAt: Date;
		updatedAt: Date;
	} | null;
}

export class GetUserByEmailUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute({
		email,
	}: GetUserByEmailUseCaseRequest): Promise<GetUserByEmailUseCaseResponse> {
		const user = await this.usersRepository.findByEmail({ email: email });

		if (!user) {
			throw new Error("User not found");
		}

		return {
			user: user,
		};
	}
}
