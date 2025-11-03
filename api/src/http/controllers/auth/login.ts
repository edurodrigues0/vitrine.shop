import type { Request, Response } from "express";
import z from "zod";
import { InvalidCredentialsError } from "~/use-cases/@errors/users/invalid-credentials-error";
import { makeAuthenticateUseCase } from "~/use-cases/@factories/users/make-authenticate-use-case";
import { setAuthCookie } from "~/utils/cookies";

const loginBodySchema = z.object({
	email: z.email(),
	password: z.string().min(8),
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica um usuário
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
