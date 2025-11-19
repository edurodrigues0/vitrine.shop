import { api } from "@/lib/api-client";

export interface Subscription {
  id: string;
  storeId: string;
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
  async findByStoreId(storeId: string): Promise<{ subscription: Subscription | null }> {
    const response = await api.get<{ subscription: Subscription | null }>(`/subscriptions/store/${storeId}`);
    return response;
  },

  async createCheckoutSession(params: CreateCheckoutSessionParams): Promise<CreateCheckoutSessionResponse> {
    const response = await api.post<CreateCheckoutSessionResponse>("/subscriptions/checkout", params);
    return response;
  },

  async cancel(subscriptionId: string): Promise<void> {
    await api.delete(`/subscriptions/${subscriptionId}`);
  },
};

