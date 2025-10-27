import { hash } from "bcryptjs";
import { BCRYPT_SALT_ROUNDS } from "~/config/constants";
import type * as schema from "~/database/schema";
import type { UsersRepository } from "~/repositories/users-repository";
import { UserAlreadyExistsError } from "../@errors/users/user-already-exists-error";

interface CreateUserUseCaseRequest {
	name: string;
	email: string;
	password: string;
	role: schema.UserRole;
}

interface CreateUserUseCaseResponse {
	user: Omit<schema.User, "password">;
}

export class CreateUserUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute({
		name,
		email,
		password,
		role,
	}: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
		const userWithSameEmail = await this.usersRepository.findByEmail({ email });

		if (userWithSameEmail) {
			throw new UserAlreadyExistsError();
		}

		const passwordHash = await hash(password, BCRYPT_SALT_ROUNDS);

		const user = await this.usersRepository.create({
			name,
			email,
			password: passwordHash,
			role,
		});

		return { user };
	}
}
