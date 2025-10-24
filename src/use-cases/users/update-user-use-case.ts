import { hash } from "bcryptjs";
import { BCRYPT_SALT_ROUNDS } from "~/config/constants";
import type * as schema from "~/database/schema";
import type { UsersRepository } from "~/repositories/users-repository";

interface UpdateUserUseCaseRequest {
	id: string;
	name?: string;
	email?: string;
	password?: string;
	role?: schema.UserRole;
}

interface UpdateUserUseCaseResponse {
	user: schema.User | null;
}

export class UpdateUserUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute({
		id,
		name,
		email,
		password,
		role,
	}: UpdateUserUseCaseRequest): Promise<UpdateUserUseCaseResponse> {
		if (!name && !email && !password && !role) {
			throw new Error("At least one field must be provided");
		}

		if (password) {
			password = await hash(password, BCRYPT_SALT_ROUNDS);
		}

		if (email) {
			const existingUser = await this.usersRepository.findByEmail({ email });
			if (existingUser && existingUser.id !== id) {
				throw new Error("Email already in use");
			}
		}

		const updatedUser = await this.usersRepository.update({
			id,
			name,
			email,
			password,
			role,
		});

		if (!updatedUser) {
			throw new Error("User not found");
		}

		return {
			user: updatedUser,
		};
	}
}
