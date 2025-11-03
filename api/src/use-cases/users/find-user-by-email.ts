import type * as schema from "~/database/schema";
import type { UsersRepository } from "~/repositories/users-repository";
import { UserNotFoundError } from "../@errors/users/user-not-found-error";

interface FindUserByEmailUseCaseRequest {
	email: string;
}

interface FindUserByEmailUseCaseResponse {
	user: schema.User | null;
}

export class FindUserByEmailUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute({
		email,
	}: FindUserByEmailUseCaseRequest): Promise<FindUserByEmailUseCaseResponse> {
		const user = await this.usersRepository.findByEmail({ email });

		if (!user) {
			throw new UserNotFoundError();
		}

		return { user };
	}
}
