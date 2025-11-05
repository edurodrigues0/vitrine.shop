import type { Response } from "express";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { makeFindUserByIdUseCase } from "~/use-cases/@factories/users/make-find-user-by-id-use-case";

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
 *                     storeId:
 *                       type: string
 *                       format: uuid
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
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

		const findUserByIdUseCase = makeFindUserByIdUseCase();
		const { user } = await findUserByIdUseCase.execute({
			id: request.user.id,
		});

		// Return user data without password
		const { passwordHash: _, ...userWithoutPassword } = user;

		return response.status(200).json({
			user: {
				id: userWithoutPassword.id,
				name: userWithoutPassword.name,
				email: userWithoutPassword.email,
				role: userWithoutPassword.role,
				storeId: userWithoutPassword.storeId,
				createdAt: userWithoutPassword.createdAt.toISOString(),
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
