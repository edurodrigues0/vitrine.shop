import { DrizzleORM } from "~/database/connection";
import { DrizzleStoresRepository } from "~/repositories/drizzle/stores-repository";
import { DrizzleUsersRepository } from "~/repositories/drizzle/users-repository";
import { StripeService } from "~/services/payment/stripe-service";
import { CreateCheckoutSessionUseCase } from "~/use-cases/subscriptions/create-checkout-session";

export function makeCreateCheckoutSessionUseCase() {
	const storesRepository = new DrizzleStoresRepository(DrizzleORM);
	const usersRepository = new DrizzleUsersRepository(DrizzleORM);
	const stripeService = new StripeService();
	return new CreateCheckoutSessionUseCase(
		storesRepository,
		usersRepository,
		stripeService,
	);
}

