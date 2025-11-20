import type { Subscription } from "~/database/schema";
import type {
	CreateSubscriptionParams,
	SubscriptionsRepository,
	UpdateSubscriptionParams,
} from "../subscriptions-repository";

export class InMemorySubscriptionsRepository
	implements SubscriptionsRepository
{
	public items: Subscription[] = [];

	async create({
		userId,
		planName,
		planId,
		provider,
		currentPeriodStart,
		currentPeriodEnd,
		price,
		status = "PENDING",
		nextPayment,
		stripeSubscriptionId,
		stripeCustomerId,
	}: CreateSubscriptionParams): Promise<Subscription> {
		const id = crypto.randomUUID();
		const createdAt = new Date();

		const subscription: Subscription = {
			id,
			userId,
			planName,
			planId,
			provider,
			currentPeriodStart,
			currentPeriodEnd,
			price,
			status,
			nextPayment: nextPayment ?? null,
			stripeSubscriptionId: stripeSubscriptionId ?? null,
			stripeCustomerId: stripeCustomerId ?? null,
			createdAt,
		};

		this.items.push(subscription);

		return subscription;
	}

	async findById({ id }: { id: string }): Promise<Subscription | null> {
		return this.items.find((item) => item.id === id) ?? null;
	}

	async findByUserId({
		userId,
	}: {
		userId: string;
	}): Promise<Subscription | null> {
		const userSubscriptions = this.items.filter(
			(item) => item.userId === userId,
		);

		if (userSubscriptions.length === 0) {
			return null;
		}

		// Retorna a mais recente
		return userSubscriptions.sort(
			(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
		)[0];
	}

	async findByStripeSubscriptionId({
		stripeSubscriptionId,
	}: {
		stripeSubscriptionId: string;
	}): Promise<Subscription | null> {
		return (
			this.items.find(
				(item) => item.stripeSubscriptionId === stripeSubscriptionId,
			) ?? null
		);
	}

	async update({
		id,
		data,
	}: UpdateSubscriptionParams): Promise<Subscription | null> {
		const subscriptionIndex = this.items.findIndex((item) => item.id === id);

		if (subscriptionIndex < 0) {
			return null;
		}

		const currentSubscription = this.items[subscriptionIndex];

		if (!currentSubscription) {
			return null;
		}

		const updatedSubscription: Subscription = {
			...currentSubscription,
			planName: data.planName ?? currentSubscription.planName,
			planId: data.planId ?? currentSubscription.planId,
			status: data.status ?? currentSubscription.status,
			currentPeriodStart:
				data.currentPeriodStart ?? currentSubscription.currentPeriodStart,
			currentPeriodEnd:
				data.currentPeriodEnd ?? currentSubscription.currentPeriodEnd,
			nextPayment: data.nextPayment ?? currentSubscription.nextPayment,
			price: data.price ?? currentSubscription.price,
			stripeSubscriptionId:
				data.stripeSubscriptionId !== undefined
					? data.stripeSubscriptionId
					: currentSubscription.stripeSubscriptionId,
			stripeCustomerId:
				data.stripeCustomerId !== undefined
					? data.stripeCustomerId
					: currentSubscription.stripeCustomerId,
		};

		this.items[subscriptionIndex] = updatedSubscription;

		return updatedSubscription;
	}

	async delete({ id }: { id: string }): Promise<void> {
		const subscriptionIndex = this.items.findIndex((item) => item.id === id);

		if (subscriptionIndex >= 0) {
			this.items.splice(subscriptionIndex, 1);
		}
	}
}

