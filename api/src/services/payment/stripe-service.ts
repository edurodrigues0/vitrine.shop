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
    try {
      console.log("Creating Stripe checkout session with params:", {
        storeId,
        storeName,
        ownerEmail,
        priceId,
        successUrl,
        cancelUrl,
      });

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

      console.log("Stripe checkout session created successfully:", {
        sessionId: session.id,
        url: session.url,
      });

      return session;
    } catch (error) {
      console.error("Stripe API error creating checkout session:", error);
      
      // Detectar erro comum: uso de Product ID ao invés de Price ID
      if (error instanceof Error && error.message.includes("No such price")) {
        const isProductId = priceId.startsWith("prod_");
        if (isProductId) {
          throw new Error(
            `Erro: Você está usando um Product ID (${priceId}) ao invés de um Price ID. ` +
            `Product IDs começam com "prod_" mas para criar sessões de checkout você precisa de Price IDs que começam com "price_". ` +
            `Acesse o Stripe Dashboard → Products → Selecione o produto → Copie o Price ID (não o Product ID) e atualize a variável de ambiente.`
          );
        }
      }
      
      throw error;
    }
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
  }

  async getPrice(priceId: string): Promise<Stripe.Price> {
    const price = await this.stripe.prices.retrieve(priceId, {
      expand: ["product"],
    });

    return price;
  }

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