import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { makeDeleteNotificationUseCase } from "~/use-cases/@factories/notifications/make-delete-notification-use-case";

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Deleta uma notificação
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
 *       204:
 *         description: Notificação deletada com sucesso
 */
export async function deleteNotificationController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { id } = request.params;

		const deleteNotificationUseCase = makeDeleteNotificationUseCase();

		await deleteNotificationUseCase.execute({ id });

		return response.status(204).send();
	} catch (error) {
		console.error("Error deleting notification:", error);
		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

