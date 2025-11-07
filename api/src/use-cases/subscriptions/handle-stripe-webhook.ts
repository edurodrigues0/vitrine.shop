import type Stripe from "stripe";
import type { SubscriptionsRepository } from "~/repositories/subscriptions-repository";
import { StripeService } from "~/services/payment/stripe-service";
import { CreateSubscriptionUseCase } from "./create-subscription";
import { UpdateSubscriptionStatusUseCase } from "./update-subscription-status";

interface HandleStripeWebhookUseCaseRequest {
	event: Stripe.Event;
}

interface HandleStripeWebhookUseCaseResponse {
	success: boolean;
}

export class HandleStripeWebhookUseCase {
	constructor(
		private readonly subscriptionsRepository: SubscriptionsRepository,
		private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
		private readonly updateSubscriptionStatusUseCase: UpdateSubscriptionStatusUseCase,
		private readonly stripeService: StripeService,
	) {}

	async execute({
		event,
	}: HandleStripeWebhookUseCaseRequest): Promise<HandleStripeWebhookUseCaseResponse> {
		try {
			switch (event.type) {
				case "checkout.session.completed": {
					const session = event.data.object as Stripe.Checkout.Session;

					if (session.mode === "subscription" && session.subscription) {
						// Buscar subscription do Stripe
						const subscriptionId =
							typeof session.subscription === "string"
								? session.subscription
								: session.subscription.id;

						const stripeSubscription =
							await this.stripeService.getSubscription(subscriptionId);

						const storeId = session.metadata?.storeId;

						if (!storeId) {
							throw new Error("Store ID not found in metadata");
						}

						// Verificar se já existe subscription
						const existingSubscription =
							await this.subscriptionsRepository.findByStripeSubscriptionId({
								stripeSubscriptionId: stripeSubscription.id,
							});

						if (!existingSubscription) {
							// Criar subscription
							const price = stripeSubscription.items.data[0]?.price;
							const planName = price?.nickname || "Basic Plan";
							const planId = price?.id || "";

							await this.createSubscriptionUseCase.execute({
								storeId,
								planName,
								planId,
								provider: "stripe",
								currentPeriodStart: new Date(
									stripeSubscription.current_period_start * 1000,
								),
								currentPeriodEnd: new Date(
									stripeSubscription.current_period_end * 1000,
								),
								price: (
									(price?.unit_amount || 0) / 100
								).toString(),
								status: "PAID",
								nextPayment: stripeSubscription.current_period_end
									? new Date(
											stripeSubscription.current_period_end * 1000,
										)
									: null,
								stripeSubscriptionId: stripeSubscription.id,
								stripeCustomerId:
									typeof stripeSubscription.customer === "string"
										? stripeSubscription.customer
										: stripeSubscription.customer?.id || null,
							});
						}
					}
					break;
				}

				case "customer.subscription.created":
				case "customer.subscription.updated": {
					const stripeSubscription =
						event.data.object as Stripe.Subscription;

					// Buscar subscription existente
					const subscription =
						await this.subscriptionsRepository.findByStripeSubscriptionId({
							stripeSubscriptionId: stripeSubscription.id,
						});

					if (subscription) {
						// Atualizar subscription
						const status =
							stripeSubscription.status === "active"
								? "PAID"
								: stripeSubscription.status === "canceled"
									? "CANCELLED"
									: "PENDING";

						await this.updateSubscriptionStatusUseCase.execute({
							id: subscription.id,
							status,
							currentPeriodStart: new Date(
								stripeSubscription.current_period_start * 1000,
							),
							currentPeriodEnd: new Date(
								stripeSubscription.current_period_end * 1000,
							),
							nextPayment: stripeSubscription.current_period_end
								? new Date(
										stripeSubscription.current_period_end * 1000,
									)
								: null,
						});
					}
					break;
				}

				case "customer.subscription.deleted": {
					const stripeSubscription =
						event.data.object as Stripe.Subscription;

					// Buscar subscription existente
					const subscription =
						await this.subscriptionsRepository.findByStripeSubscriptionId({
							stripeSubscriptionId: stripeSubscription.id,
						});

					if (subscription) {
						// Atualizar status para CANCELLED
						await this.updateSubscriptionStatusUseCase.execute({
							id: subscription.id,
							status: "CANCELLED",
						});
					}
					break;
				}

				case "invoice.payment_succeeded": {
					const invoice = event.data.object as Stripe.Invoice;

					if (invoice.subscription) {
						const subscriptionId =
							typeof invoice.subscription === "string"
								? invoice.subscription
								: invoice.subscription.id;

						const subscription =
							await this.subscriptionsRepository.findByStripeSubscriptionId({
								stripeSubscriptionId: subscriptionId,
							});

						if (subscription) {
							// Confirmar pagamento
							await this.updateSubscriptionStatusUseCase.execute({
								id: subscription.id,
								status: "PAID",
							});
						}
					}
					break;
				}

				case "invoice.payment_failed": {
					const invoice = event.data.object as Stripe.Invoice;

					if (invoice.subscription) {
						const subscriptionId =
							typeof invoice.subscription === "string"
								? invoice.subscription
								: invoice.subscription.id;

						const subscription =
							await this.subscriptionsRepository.findByStripeSubscriptionId({
								stripeSubscriptionId: subscriptionId,
							});

						if (subscription) {
							// Atualizar para PENDING (aguardando pagamento)
							await this.updateSubscriptionStatusUseCase.execute({
								id: subscription.id,
								status: "PENDING",
							});
						}
					}
					break;
				}

				default:
					// Evento não tratado
					break;
			}

			return { success: true };
		} catch (error) {
			console.error("Error handling Stripe webhook:", error);
			throw error;
		}
	}
}

