import type { User } from "~/database/schema";
import type { UsersRepository } from "~/repositories/users-repository";

interface UpdateUserUseCaseRequest {
	id: string;
	data: {
		name?: string;
		email?: string;
		password?: string;
		role?: "ADMIN" | "OWNER" | "EMPLOYEE";
	};
}

interface UpdateUserUseCaseResponse {
	user: User | null;
}

export class UpdateUserUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute({
		id,
		data,
	}: UpdateUserUseCaseRequest): Promise<UpdateUserUseCaseResponse> {
		const user = await this.usersRepository.update({
			id,
			name: data.name,
			email: data.email,
			password: data.password,
			role: data.role,
		});

		return { user };
	}
}
