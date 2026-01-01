import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./authenticate";
import { makeFindSubscriptionByUserIdUseCase } from "~/use-cases/@factories/subscriptions/make-find-subscription-by-user-id-use-case";

export async function requirePaidSubscription(
	request: AuthenticatedRequest,
	response: Response,
	next: NextFunction,
) {
	try {
		const userId = request.user?.id;

		if (!userId) {
			return response.status(401).json({
				message: "Unauthorized",
			});
		}

		const findSubscriptionByUserIdUseCase =
			makeFindSubscriptionByUserIdUseCase();

		const { subscription } = await findSubscriptionByUserIdUseCase.execute({
			userId,
		});

		// Verifica se existe assinatura
		if (!subscription) {
			return response.status(403).json({
				message: "Subscription required",
				code: "SUBSCRIPTION_REQUIRED",
			});
		}

		// Verifica se status é PAID
		if (subscription.status !== "PAID") {
			return response.status(403).json({
				message: "Active subscription required",
				code: "SUBSCRIPTION_NOT_PAID",
				subscriptionStatus: subscription.status,
			});
		}

		// Verifica se não expirou
		const now = new Date();
		const periodEnd = new Date(subscription.currentPeriodEnd);

		if (now > periodEnd) {
			return response.status(403).json({
				message: "Subscription expired",
				code: "SUBSCRIPTION_EXPIRED",
				expiredAt: subscription.currentPeriodEnd,
			});
		}

		// Adicionar subscription à requisição para uso posterior
		(request as AuthenticatedRequest & { subscription: typeof subscription }).subscription = subscription;

		next();
	} catch (error) {
		console.error("Error in requirePaidSubscription middleware:", error);
		return response.status(500).json({
			message: "Internal server error",
		});
	}
}