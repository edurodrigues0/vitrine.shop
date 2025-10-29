import type { Request, Response } from "express";
import z from "zod";
import { InvalidCredentialsError } from "~/use-cases/@errors/users/invalid-credentials-error";
import { makeAuthenticateUseCase } from "~/use-cases/@factories/users/make-authenticate-use-case";
import { setAuthCookie } from "~/utils/cookies";

const loginBodySchema = z.object({
	email: z.email(),
	password: z.string().min(8),
});

export async function loginController(request: Request, response: Response) {
	const { email, password } = loginBodySchema.parse(request.body);

	try {
		const authenticateUseCase = makeAuthenticateUseCase();

		const { user, token } = await authenticateUseCase.execute({
			email,
			password,
		});

		setAuthCookie(response, token);

		return response.status(200).json({
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
			token,
		});
	} catch (error) {
		if (error instanceof InvalidCredentialsError) {
			return response.status(401).json({
				error: error.message,
			});
		}

		return response.status(500).json({
			error: "Internal server error",
		});
	}
}
