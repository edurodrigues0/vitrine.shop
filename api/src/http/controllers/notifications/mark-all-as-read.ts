import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { makeMarkAllNotificationsAsReadUseCase } from "~/use-cases/@factories/notifications/make-mark-all-notifications-as-read-use-case";

/**
 * @swagger
 * /notifications/read-all:
 *   put:
 *     summary: Marca todas as notificações do usuário como lidas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Todas as notificações foram marcadas como lidas
 */
export async function markAllNotificationsAsReadController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const userId = request.user!.id;

		const markAllAsReadUseCase = makeMarkAllNotificationsAsReadUseCase();

		await markAllAsReadUseCase.execute({ userId });

		return response.status(200).json({
			message: "All notifications marked as read",
		});
	} catch (error) {
		console.error("Error marking all notifications as read:", error);
		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

