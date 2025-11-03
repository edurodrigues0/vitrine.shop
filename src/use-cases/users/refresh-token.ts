import type { UsersRepository } from "~/repositories/users-repository";
import { generateToken, verifyToken } from "~/utils/jwt";
import { InvalidTokenError } from "../@errors/users/invalid-token-error";
import { UserNotFoundError } from "../@errors/users/user-not-found-error";

interface RefreshTokenUseCaseRequest {
	token: string;
}

interface RefreshTokenUseCaseResponse {
	user: {
		id: string;
		name: string;
		email: string;
		role: string;
	};
	token: string;
}

export class RefreshTokenUseCase {
	constructor(private readonly usersRepository: UsersRepository) {}

	async execute({
		token,
	}: RefreshTokenUseCaseRequest): Promise<RefreshTokenUseCaseResponse> {
		try {
			// Verifica se o token é válido
			const payload = verifyToken(token);

			// Busca o usuário pelo ID do token
			const user = await this.usersRepository.findById({
				id: payload.sub,
			});

			if (!user) {
				throw new UserNotFoundError();
			}

			// Gera um novo token com as informações atualizadas do usuário
			const newToken = generateToken({
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
				token: newToken,
			};
		} catch (error) {
			// Se o erro já for InvalidTokenError ou UserNotFoundError, relança
			if (
				error instanceof InvalidTokenError ||
				error instanceof UserNotFoundError
			) {
				throw error;
			}

			// Qualquer outro erro (token inválido, expirado, etc.) vira InvalidTokenError
			throw new InvalidTokenError();
		}
	}
}
