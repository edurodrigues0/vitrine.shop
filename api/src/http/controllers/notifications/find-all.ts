import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { makeFindAllNotificationsUseCase } from "~/use-cases/@factories/notifications/make-find-all-notifications-use-case";

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Lista todas as notificações do usuário
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: read
 *         schema:
 *           type: boolean
 *         description: Filtrar por notificações lidas/não lidas
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Limite de notificações por página
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *     responses:
 *       200:
 *         description: Lista de notificações
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 unreadCount:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     perPage:
 *                       type: integer
 */
export async function findAllNotificationsController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const userId = request.user!.id;
		const read = request.query.read === "true" ? true : request.query.read === "false" ? false : undefined;
		const limit = request.query.limit ? parseInt(request.query.limit as string, 10) : 50;
		const page = request.query.page ? parseInt(request.query.page as string, 10) : 1;

		const findAllNotificationsUseCase = makeFindAllNotificationsUseCase();

		const result = await findAllNotificationsUseCase.execute({
			userId,
			read,
			limit,
			page,
		});

		return response.status(200).json(result);
	} catch (error) {
		console.error("Error finding notifications:", error);
		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

