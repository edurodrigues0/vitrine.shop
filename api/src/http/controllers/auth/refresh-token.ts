import type { Request, Response } from "express";
import { InvalidTokenError } from "~/use-cases/@errors/users/invalid-token-error";
import { UserNotFoundError } from "~/use-cases/@errors/users/user-not-found-error";
import { makeRefreshTokenUseCase } from "~/use-cases/@factories/users/make-refresh-token-use-case";
import { getAuthCookie, setAuthCookie } from "~/utils/cookies";

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Atualiza o token de autenticação do usuário
 *     description: |
 *       Endpoint para renovar o token de autenticação quando o token atual está próximo de expirar.
 *       O token pode ser enviado via cookie (recomendado) ou no header Authorization.
 *       Se enviado via cookie, o token será lido automaticamente. Se enviado via header,
 *       deve estar no formato "Bearer {token}".
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: false
 *       description: |
 *         O token pode ser enviado via cookie (preferencial) ou no body.
 *         Se enviado via cookie, este body é opcional.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token atual do usuário (opcional se enviado via cookie)
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         schema:
 *           type: string
 *           format: bearer
 *         description: Token de autenticação no formato "Bearer {token}" (opcional)
 *         required: false
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *         headers:
 *           Set-Cookie:
 *             description: Cookie com o novo token de autenticação
 *             schema:
 *               type: string
 *               example: "auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict"
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
 *                       description: ID único do usuário
 *                     name:
 *                       type: string
 *                       description: Nome do usuário
 *                       example: "João Silva"
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: Email do usuário
 *                       example: "joao@example.com"
 *                     role:
 *                       type: string
 *                       enum: [ADMIN, OWNER, EMPLOYEE]
 *                       description: Papel do usuário no sistema
 *                       example: "OWNER"
 *                 token:
 *                   type: string
 *                   description: Novo token JWT gerado
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Token não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Token não fornecido"
 *       401:
 *         description: Token inválido ou expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Token inválido ou expirado"
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Usuário não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
 */
export async function refreshTokenController(
	request: Request,
	response: Response,
) {
	try {
		// Tenta obter o token do cookie primeiro (método preferencial)
		let token = getAuthCookie(request);

		// Se não estiver no cookie, tenta obter do header Authorization
		if (!token) {
			const authHeader = request.headers.authorization;
			if (authHeader?.startsWith("Bearer ")) {
				token = authHeader.substring(7);
			}
		}

		// Se ainda não tiver token, tenta obter do body
		if (!token) {
			token = request.body?.token;
		}

		if (!token) {
			return response.status(400).json({
				message: "Token não fornecido",
			});
		}

		const refreshTokenUseCase = makeRefreshTokenUseCase();

		const { user, token: newToken } = await refreshTokenUseCase.execute({
			token,
		});

		// Define o novo token no cookie
		setAuthCookie(response, newToken);

		return response.status(200).json({
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
			token: newToken,
		});
	} catch (error) {
		if (error instanceof InvalidTokenError) {
			return response.status(401).json({
				message: error.message,
			});
		}

		if (error instanceof UserNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		console.error("Error refreshing token:", error);

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
