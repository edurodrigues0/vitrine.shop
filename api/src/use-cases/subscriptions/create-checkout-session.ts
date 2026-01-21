import type { UsersRepository } from "~/repositories/users-repository";
import type { StoresRepository } from "~/repositories/stores-repository";
import { StripeService } from "~/services/payment/stripe-service";
import { StoreNotFoundError } from "../@errors/stores/store-not-found-error";
import { UserNotFoundError } from "../@errors/users/user-not-found-error";

interface CreateCheckoutSessionUseCaseRequest {
	storeId: string;
	priceId: string;
	successUrl: string;
	cancelUrl: string;
}

interface CreateCheckoutSessionUseCaseResponse {
	checkoutUrl: string;
}

export class CreateCheckoutSessionUseCase {
	constructor(
		private readonly storesRepository: StoresRepository,
		private readonly usersRepository: UsersRepository,
		private readonly stripeService: StripeService,
	) {}

	async execute({
		storeId,
		priceId,
		successUrl,
		cancelUrl,
	}: CreateCheckoutSessionUseCaseRequest): Promise<CreateCheckoutSessionUseCaseResponse> {
		// Validar loja
		const store = await this.storesRepository.findById({ id: storeId });

		if (!store) {
			throw new StoreNotFoundError();
		}

		// Buscar email do owner
		const owner = await this.usersRepository.findById({ id: store.ownerId });

		if (!owner) {
			throw new UserNotFoundError();
		}

		if (!owner.email) {
			throw new Error("Owner email is required");
		}

		// Criar sessão de checkout no Stripe
		const session = await this.stripeService.createCheckoutSession({
			storeId,
			storeName: store.name,
			ownerEmail: owner.email,
			priceId,
			successUrl,
			cancelUrl,
		});

		console.log("Stripe session created:", {
			sessionId: session.id,
			url: session.url,
			mode: session.mode,
		});

		if (!session.url) {
			console.error("Stripe session created but URL is missing:", {
				sessionId: session.id,
				session: JSON.stringify(session, null, 2),
			});
			throw new Error("Failed to create checkout session: URL is missing");
		}

		return { checkoutUrl: session.url };
	}
}

