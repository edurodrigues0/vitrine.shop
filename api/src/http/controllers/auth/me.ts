import type { Response, Request } from "express";
import { auth } from "~/services/auth";
import { fromNodeHeaders } from "better-auth/node";
import type { IncomingHttpHeaders } from "http";
/**
 * @swagger
 * /me:
 *   get:
 *     summary: Retorna informações do usuário autenticado
 *     description: |
 *       Endpoint customizado que retorna informações do usuário autenticado usando Better Auth.
 *       Formata a resposta para manter compatibilidade com o formato esperado pelo frontend.
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
 *                       description: ID único do usuário (text, compatível com Better Auth)
 *                       example: "MRmketTXwV8sEdr5vVyquaRpdbf6omq9"
 *                     name:
 *                       type: string
 *                       nullable: true
 *                       description: Nome do usuário
 *                       example: "João Silva"
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: Email do usuário
 *                       example: "usuario@example.com"
 *                     role:
 *                       type: string
 *                       enum: [ADMIN, OWNER, EMPLOYEE]
 *                       description: Papel do usuário no sistema
 *                       example: "OWNER"
 *                     storeId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                       description: ID da loja associada ao usuário (se houver)
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Data de criação da conta
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
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function meController(
	request: Request,
	response: Response,
) {
	try {
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(request.headers as IncomingHttpHeaders),
		});

		if (!session || !session.user) {
			return response.status(401).json({
				error: "Unauthorized",
			});
		}

		// Formatar resposta para manter compatibilidade com o formato esperado pelo frontend
		return response.status(200).json({
			user: {
				id: session.user.id,
				name: session.user.name,
				email: session.user.email,
				role: (session.user as { role?: string }).role || "EMPLOYEE",
				storeId: (session.user as { storeId?: string }).storeId || null,
				createdAt: session.user.createdAt,
			},
		});
	} catch (error) {
		console.error("Error in meController:", error);

		// If user not found, return 404
		if (error instanceof Error && error.message.includes("not found")) {
			return response.status(404).json({
				error: "User not found",
			});
		}

		return response.status(500).json({
			error: "Internal server error",
		});
	}
}
