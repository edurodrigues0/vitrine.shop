import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { OrderNotFoundError } from "~/use-cases/@errors/orders/order-not-found-error";
import { makeUpdateOrderStatusUseCase } from "~/use-cases/@factories/orders/make-update-order-status-use-case";

const updateOrderStatusBodySchema = z.object({
	status: z.enum(["PENDENTE", "CONFIRMADO", "PREPARANDO", "ENVIADO", "ENTREGUE", "CANCELADO"]),
});

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Atualiza o status de um pedido
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDENTE, CONFIRMADO, PREPARANDO, ENVIADO, ENTREGUE, CANCELADO]
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Pedido não encontrado
 */
export async function updateOrderStatusController(
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

		const body = updateOrderStatusBodySchema.parse(request.body);

		const updateOrderStatusUseCase = makeUpdateOrderStatusUseCase();

		const { order } = await updateOrderStatusUseCase.execute({
			id,
			status: body.status,
		});

		return response.status(200).json({
			order,
		});
	} catch (error) {
		console.error("Error updating order status:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

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

