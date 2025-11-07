import Stripe from "stripe";

interface CreateCheckoutSessionParams {
  storeId: string;
  storeName: string;
  ownerEmail: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

interface CreateCustomerParams {
  email: string;
  name: string;
  metadata: Record<string, string>;
}

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2025-10-29.clover",
    })
  }

  async createCheckoutSession({
    storeId,
    storeName,
    ownerEmail,
    priceId,
    successUrl,
    cancelUrl,
  }: CreateCheckoutSessionParams) {
    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: ownerEmail,
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      metadata: {
        storeId,
        storeName,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          storeId,
        },
      },
    });

    return session;
  }

  async createCustomer({
    email,
    name,
    metadata,
  }: CreateCustomerParams): Promise<Stripe.Customer> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata,
    });

    return customer;
  }

  async getSubscription(
    subscriptionId: string,
  ): Promise<Stripe.Subscription> {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

    return subscription;
  };

  async cancelSubscription(
    subscriptionId: string,
    immediately = false,
  ): Promise<Stripe.Subscription> {
    if (immediately) {
      return await this.stripe.subscriptions.cancel(subscriptionId, {
        prorate: false,
      });
    }

    return await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }

	constructWebhookEvent(
		payload: string | Buffer,
		signature: string,
	): Stripe.Event {
		return this.stripe.webhooks.constructEvent(
			payload,
			signature,
			process.env.STRIPE_WEBHOOK_SECRET as string,
		);
	}
}

export const stripeService = new StripeService();