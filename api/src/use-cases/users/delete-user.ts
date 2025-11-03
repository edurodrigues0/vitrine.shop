import type { UsersRepository } from "~/repositories/users-repository";
import { UserNotFoundError } from "../@errors/users/user-not-found-error";

interface DeleteUserUseCaseRequest {
	id: string;
}

export class DeleteUserUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute({ id }: DeleteUserUseCaseRequest): Promise<void> {
		const user = await this.usersRepository.findById({ id });

		if (!user) {
			throw new UserNotFoundError();
		}

		await this.usersRepository.delete({ id });
	}
}
