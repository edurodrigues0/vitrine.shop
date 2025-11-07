import { DrizzleORM } from "~/database/connection";
import { DrizzleStoresRepository } from "~/repositories/drizzle/stores-repository";
import { DrizzleSubscriptionsRepository } from "~/repositories/drizzle/subscriptions-repository";
import { StripeService } from "~/services/payment/stripe-service";
import { CancelSubscriptionUseCase } from "~/use-cases/subscriptions/cancel-subscription";

export function makeCancelSubscriptionUseCase() {
	const subscriptionsRepository = new DrizzleSubscriptionsRepository(DrizzleORM);
	const storesRepository = new DrizzleStoresRepository(DrizzleORM);
	const stripeService = new StripeService();
	return new CancelSubscriptionUseCase(
		subscriptionsRepository,
		storesRepository,
		stripeService,
	);
}

