import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { makeFindOrdersByStoreUseCase } from "~/use-cases/@factories/orders/make-find-orders-by-store-use-case";

const findOrdersByStoreQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	status: z.string().optional(),
	customerName: z.string().optional(),
	customerPhone: z.string().optional(),
});

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Lista pedidos de uma loja
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDENTE, CONFIRMADO, PREPARANDO, ENVIADO, ENTREGUE, CANCELADO]
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *       401:
 *         description: Não autenticado
 */
export async function findOrdersByStoreController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const query = findOrdersByStoreQuerySchema.parse(request.query);

		if (!request.user) {
			return response.status(401).json({
				message: "Unauthorized",
			});
		}

		// Buscar loja do usuário autenticado
		// TODO: Implementar busca de loja pelo ownerId
		const storeId = request.query.storeId as string;

		if (!storeId) {
			return response.status(400).json({
				message: "Store ID is required",
			});
		}

		const findOrdersByStoreUseCase = makeFindOrdersByStoreUseCase();

		const result = await findOrdersByStoreUseCase.execute({
			storeId,
			page: query.page,
			limit: query.limit,
			status: query.status,
			customerName: query.customerName,
			customerPhone: query.customerPhone,
		});

		return response.status(200).json(result);
	} catch (error) {
		console.error("Error finding orders:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

