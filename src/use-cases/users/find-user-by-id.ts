import type * as schema from "~/database/schema";
import type { UsersRepository } from "~/repositories/users-repository";

interface FindUserByIdUseCaseRequest {
	id: string;
}

interface FindUserByIdUseCaseResponse {
	user: schema.User | null;
}

export class FindUserByIdUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute({
		id,
	}: FindUserByIdUseCaseRequest): Promise<FindUserByIdUseCaseResponse> {
		const user = await this.usersRepository.findById({ id });

		if (!user) {
			throw new Error("User not found");
		}

		return { user };
	}
}
