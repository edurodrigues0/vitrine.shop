import type * as schema from "~/database/schema";

export interface CreateSubscriptionParams {
	storeId: string;
	planName: string;
	planId: string;
	provider: string;
	currentPeriodStart: Date;
	currentPeriodEnd: Date;
	price: string;
	status?: "PAID" | "PENDING" | "CANCELLED";
	nextPayment?: Date | null;
	stripeSubscriptionId?: string | null;
	stripeCustomerId?: string | null;
}

export interface UpdateSubscriptionParams {
	id: string;
	data: {
		planName?: string;
		planId?: string;
		status?: "PAID" | "PENDING" | "CANCELLED";
		currentPeriodStart?: Date;
		currentPeriodEnd?: Date;
		nextPayment?: Date | null;
		price?: string;
		stripeSubscriptionId?: string | null;
		stripeCustomerId?: string | null;
	};
}

export interface SubscriptionsRepository {
	create(params: CreateSubscriptionParams): Promise<schema.Subscription>;
	findById({ id }: { id: string }): Promise<schema.Subscription | null>;
	findByStoreId({ storeId }: { storeId: string }): Promise<schema.Subscription | null>;
	findByStripeSubscriptionId({
		stripeSubscriptionId,
	}: {
		stripeSubscriptionId: string;
	}): Promise<schema.Subscription | null>;
	update(params: UpdateSubscriptionParams): Promise<schema.Subscription | null>;
	delete({ id }: { id: string }): Promise<void>;
}

