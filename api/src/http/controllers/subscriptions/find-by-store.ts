import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { makeFindSubscriptionByStoreIdUseCase } from "~/use-cases/@factories/subscriptions/make-find-subscription-by-store-id-use-case";

const findSubscriptionByStoreParamsSchema = z.object({
	storeId: z.string().uuid("Store ID must be a valid UUID"),
});

/**
 * @swagger
 * /subscriptions/store/{storeId}:
 *   get:
 *     summary: Busca assinatura por ID da loja
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da loja
 *     responses:
 *       200:
 *         description: Assinatura encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscription:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     storeId:
 *                       type: string
 *                       format: uuid
 *                     planName:
 *                       type: string
 *                     planId:
 *                       type: string
 *                     provider:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [PAID, PENDING, CANCELLED]
 *                     price:
 *                       type: string
 *                     currentPeriodStart:
 *                       type: string
 *                       format: date-time
 *                     currentPeriodEnd:
 *                       type: string
 *                       format: date-time
 *                     nextPayment:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     stripeSubscriptionId:
 *                       type: string
 *                       nullable: true
 *                     stripeCustomerId:
 *                       type: string
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
 */
export async function findSubscriptionByStoreController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { storeId } = findSubscriptionByStoreParamsSchema.parse(
			request.params,
		);

		const findSubscriptionByStoreIdUseCase =
			makeFindSubscriptionByStoreIdUseCase();

		const { subscription } = await findSubscriptionByStoreIdUseCase.execute({
			storeId,
		});

		return response.status(200).json({
			subscription,
		});
	} catch (error) {
		console.error("Error finding subscription by store:", error);

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

