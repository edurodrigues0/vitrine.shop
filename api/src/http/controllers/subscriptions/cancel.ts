import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { SubscriptionNotFoundError } from "~/use-cases/@errors/subscriptions/subscription-not-found-error";
import { makeCancelSubscriptionUseCase } from "~/use-cases/@factories/subscriptions/make-cancel-subscription-use-case";

const cancelSubscriptionParamsSchema = z.object({
	id: z.string().uuid("Subscription ID must be a valid UUID"),
});

const cancelSubscriptionQuerySchema = z.object({
	immediately: z
		.string()
		.optional()
		.transform((val) => val === "true"),
});

/**
 * @swagger
 * /subscriptions/{id}:
 *   delete:
 *     summary: Cancela uma assinatura
 *     tags: [Subscriptions]
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
 *         description: ID da assinatura
 *       - in: query
 *         name: immediately
 *         schema:
 *           type: boolean
 *         description: Se true, cancela imediatamente. Se false, cancela ao final do período
 *     responses:
 *       200:
 *         description: Assinatura cancelada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subscription:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     status:
 *                       type: string
 *                       enum: [PAID, PENDING, CANCELLED]
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Assinatura não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
export async function cancelSubscriptionController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { id } = cancelSubscriptionParamsSchema.parse(request.params);
		const { immediately = false } = cancelSubscriptionQuerySchema.parse(
			request.query,
		);

		const cancelSubscriptionUseCase = makeCancelSubscriptionUseCase();

		const { subscription } = await cancelSubscriptionUseCase.execute({
			id,
			immediately,
		});

		return response.status(200).json({
			subscription,
		});
	} catch (error) {
		console.error("Error canceling subscription:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof SubscriptionNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

