import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { makeMarkNotificationAsReadUseCase } from "~/use-cases/@factories/notifications/make-mark-notification-as-read-use-case";

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Marca uma notificação como lida
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da notificação
 *     responses:
 *       200:
 *         description: Notificação marcada como lida
 *       404:
 *         description: Notificação não encontrada
 */
export async function markNotificationAsReadController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { id } = request.params;

		const markAsReadUseCase = makeMarkNotificationAsReadUseCase();

		const { notification } = await markAsReadUseCase.execute({ id });

		return response.status(200).json({ notification });
	} catch (error) {
		console.error("Error marking notification as read:", error);
		
		if (error instanceof Error && error.message === "Notification not found") {
			return response.status(404).json({
				message: "Notification not found",
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

