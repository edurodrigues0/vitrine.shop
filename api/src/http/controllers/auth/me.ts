import type { Response } from "express";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Retorna informações do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Informações do usuário autenticado
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
 *       401:
 *         description: Usuário não autenticado
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
export async function meController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		if (!request.user) {
			return response.status(401).json({
				error: "User not authenticated",
			});
		}

		return response.status(200).json({
			user: request.user,
		});
	} catch (_error) {
		return response.status(500).json({
			error: "Internal server error",
		});
	}
}
