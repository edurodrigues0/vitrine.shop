import type { UsersRepository } from "~/repositories/users-repository";

interface DeleteUserUseCaseRequest {
	id: string;
}

export class DeleteUserUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute({ id }: DeleteUserUseCaseRequest): Promise<void> {
		await this.usersRepository.delete({ id });
	}
}
