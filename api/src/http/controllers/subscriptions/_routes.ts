import { Router } from "express";
import { authenticateMiddleware } from "~/http/middleware/authenticate";
import { authenticatedRateLimit, publicRateLimit } from "~/http/middleware/rate-limit";
import { cancelSubscriptionController } from "./cancel";
import { createCheckoutSessionController } from "./create-checkout-session";
import { findSubscriptionByStoreController } from "./find-by-store";
import { webhookController } from "./webhook";

export const subscriptionsRoutes = Router();

// Webhook deve ser público e não usar JSON parser padrão (usa raw body)
subscriptionsRoutes.post(
	"/subscriptions/webhook",
	publicRateLimit,
	webhookController,
);

// Rotas autenticadas
subscriptionsRoutes.post(
	"/subscriptions/checkout",
	authenticatedRateLimit,
	authenticateMiddleware,
	createCheckoutSessionController,
);

subscriptionsRoutes.get(
	"/subscriptions/store/:storeId",
	authenticatedRateLimit,
	authenticateMiddleware,
	findSubscriptionByStoreController,
);

subscriptionsRoutes.delete(
	"/subscriptions/:id",
	authenticatedRateLimit,
	authenticateMiddleware,
	cancelSubscriptionController,
);

