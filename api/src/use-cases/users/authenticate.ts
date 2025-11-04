import { compare } from "bcryptjs";
import type { UsersRepository } from "~/repositories/users-repository";
import { generateToken } from "~/utils/jwt";
import { InvalidCredentialsError } from "../@errors/users/invalid-credentials-error";

interface AuthenticateUseCaseRequest {
	email: string;
	password: string;
}

interface AuthenticateUseCaseResponse {
	user: {
		id: string;
		name: string;
		email: string;
		role: string;
	};
	token: string;
}

export class AuthenticateUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute({
		email,
		password,
	}: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
		const user = await this.usersRepository.findByEmail({ email });

		if (!user) {
			throw new InvalidCredentialsError();
		}

		const doesPasswordMatch = await compare(password, user.passwordHash);

		if (!doesPasswordMatch) {
			throw new InvalidCredentialsError();
		}

		const token = generateToken({
			userId: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
		});

		return {
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
			token,
		};
	}
}
