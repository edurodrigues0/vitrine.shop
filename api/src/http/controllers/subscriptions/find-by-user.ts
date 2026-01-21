import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { makeFindSubscriptionByUserIdUseCase } from "~/use-cases/@factories/subscriptions/make-find-subscription-by-user-id-use-case";

const findSubscriptionByUserParamsSchema = z.object({
	userId: z.string().min(1, "User ID is required"), // Better Auth usa text como ID, não UUID
});

/**
 * @swagger
 * /subscriptions/user/{userId}:
 *   get:
 *     summary: Busca assinatura por ID do usuário
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário (text, compatível com Better Auth)
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
 *                     userId:
 *                       type: string
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
export async function findSubscriptionByUserController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { userId } = findSubscriptionByUserParamsSchema.parse(
			request.params,
		);

		const findSubscriptionByUserIdUseCase =
			makeFindSubscriptionByUserIdUseCase();

		const { subscription } = await findSubscriptionByUserIdUseCase.execute({
			userId,
		});

		return response.status(200).json({
			subscription,
		});
	} catch (error) {
		console.error("Error finding subscription by user:", error);

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

