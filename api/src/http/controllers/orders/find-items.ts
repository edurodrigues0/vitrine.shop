import type { Response } from "express";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { DrizzleORM } from "~/database/connection";
import { DrizzleOrderItemsRepository } from "~/repositories/drizzle/orders-repository";

/**
 * @swagger
 * /orders/{id}/items:
 *   get:
 *     summary: Busca os itens de um pedido
 *     tags: [Orders]
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
 *     responses:
 *       200:
 *         description: Itens do pedido
 */
export async function findOrderItemsController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { id } = request.params;

		if (!id) {
			return response.status(400).json({
				message: "ID do pedido é obrigatório",
			});
		}

		const orderItemsRepository = new DrizzleOrderItemsRepository(DrizzleORM);

		const items = await orderItemsRepository.findByOrderId({ orderId: id });

		return response.status(200).json({
			items,
		});
	} catch (error) {
		console.error("Error finding order items:", error);

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

