import type { Request, Response } from "express";
import { auth } from "~/services/auth";

/**
 * @swagger
 * /auth/sign-out:
 *   post:
 *     summary: Faz logout do usuário atual (Better Auth)
 *     description: |
 *       Endpoint do Better Auth para fazer logout e invalidar a sessão atual.
 *       Remove o cookie de sessão e invalida o token de autenticação.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Signed out successfully"
 *       401:
 *         description: Usuário não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function signOutController(request: Request, response: Response) {
	try {
		// Remove o cookie de autenticação
		await auth.api.signOut({
			headers: request.headers,
		})

		return response.status(200).json({
			message: "Logged out successfully",
		});
	} catch (_error) {
		return response.status(500).json({
			error: "Internal server error",
		});
	}
}
