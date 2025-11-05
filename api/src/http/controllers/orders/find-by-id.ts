import type { Response } from "express";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { OrderNotFoundError } from "~/use-cases/@errors/orders/order-not-found-error";
import { makeFindOrderByIdUseCase } from "~/use-cases/@factories/orders/make-find-order-by-id-use-case";

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Busca um pedido por ID
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
 *         description: Pedido encontrado
 *       404:
 *         description: Pedido não encontrado
 */
export async function findOrderByIdController(
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

		const findOrderByIdUseCase = makeFindOrderByIdUseCase();

		const { order } = await findOrderByIdUseCase.execute({ id });

		return response.status(200).json({
			order,
		});
	} catch (error) {
		console.error("Error finding order by ID:", error);

		if (error instanceof OrderNotFoundError) {
			return response.status(404).json({
				message: "Pedido não encontrado",
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

