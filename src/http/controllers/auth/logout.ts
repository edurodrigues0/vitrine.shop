import type { Request, Response } from "express";
import { clearAuthCookie } from "~/utils/cookies";

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Faz logout do usuário atual
 *     tags: [Auth]
 *     security: []
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
 *                   example: Logged out successfully
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function logoutController(_request: Request, response: Response) {
	try {
		// Remove o cookie de autenticação
		clearAuthCookie(response);

		return response.status(200).json({
			message: "Logged out successfully",
		});
	} catch (_error) {
		return response.status(500).json({
			error: "Internal server error",
		});
	}
}
