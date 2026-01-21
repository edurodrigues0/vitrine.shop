import { api } from "@/lib/api-client";

export interface Subscription {
  id: string;
  userId: string;
  planName: string;
  planId: string;
  provider: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  price: string;
  status: "PAID" | "PENDING" | "CANCELLED";
  nextPayment?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  createdAt: string;
}

export interface CreateCheckoutSessionParams {
  storeId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  checkoutUrl: string;
}

export const subscriptionsService = {
  async findByUserId(userId: string): Promise<{ subscription: Subscription | null }> {
    const response = await api.get<{ subscription: Subscription | null }>(`/subscriptions/user/${userId}`);
    return response;
  },

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CreateCheckoutSessionResponse> {
    console.log("Creating checkout session with params:", params);
    const response = await api.post<CreateCheckoutSessionResponse>("/subscriptions/checkout", params);
    console.log("Checkout session response:", response);
    
    if (!response.checkoutUrl) {
      console.error("Checkout URL missing in response:", response);
      throw new Error("URL de checkout não retornada pela API");
    }
    
    return response;
  },

  async cancel(subscriptionId: string): Promise<void> {
    await api.delete(`/subscriptions/${subscriptionId}`);
  },
};

