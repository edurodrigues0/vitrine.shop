import { DrizzleORM } from "~/database/connection";
import { DrizzleStoresRepository } from "~/repositories/drizzle/stores-repository";
import { DrizzleSubscriptionsRepository } from "~/repositories/drizzle/subscriptions-repository";
import { StripeService } from "~/services/payment/stripe-service";
import { CreateSubscriptionUseCase } from "~/use-cases/subscriptions/create-subscription";
import { HandleStripeWebhookUseCase } from "~/use-cases/subscriptions/handle-stripe-webhook";
import { UpdateSubscriptionStatusUseCase } from "~/use-cases/subscriptions/update-subscription-status";

export function makeHandleStripeWebhookUseCase() {
	const subscriptionsRepository = new DrizzleSubscriptionsRepository(DrizzleORM);
	const storesRepository = new DrizzleStoresRepository(DrizzleORM);
	const stripeService = new StripeService();

	const createSubscriptionUseCase = new CreateSubscriptionUseCase(
		subscriptionsRepository,
		storesRepository,
	);

	const updateSubscriptionStatusUseCase = new UpdateSubscriptionStatusUseCase(
		subscriptionsRepository,
		storesRepository,
	);

	return new HandleStripeWebhookUseCase(
		subscriptionsRepository,
		createSubscriptionUseCase,
		updateSubscriptionStatusUseCase,
		stripeService,
	);
}

