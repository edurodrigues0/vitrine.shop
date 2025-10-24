import type { UsersRepository } from "~/repositories/users-repository";

interface DeleteUserUseCaseRequest {
	id: string;
}

export class DeleteUserUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute({ id }: DeleteUserUseCaseRequest): Promise<void> {
		const user = await this.usersRepository.findById({ id });

		if (!user) {
			throw new Error("User not found");
		}

		await this.usersRepository.delete({ id });
	}
}
