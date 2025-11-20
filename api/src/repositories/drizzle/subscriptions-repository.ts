import { desc, eq } from "drizzle-orm";
import type { DrizzleORM } from "~/database/connection";
import { type Subscription, subscriptions } from "~/database/schema";
import type {
	CreateSubscriptionParams,
	SubscriptionsRepository,
	UpdateSubscriptionParams,
} from "../subscriptions-repository";

export class DrizzleSubscriptionsRepository implements SubscriptionsRepository {
	constructor(private readonly drizzle: typeof DrizzleORM) {}

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
		const [subscription] = await this.drizzle
			.insert(subscriptions)
			.values({
				userId,
				planName,
				planId,
				provider,
				currentPeriodStart,
				currentPeriodEnd,
				price,
				status,
				nextPayment,
				stripeSubscriptionId: stripeSubscriptionId ?? null,
				stripeCustomerId: stripeCustomerId ?? null,
			})
			.returning();

		if (!subscription) {
			throw new Error("Failed to create subscription");
		}

		return subscription;
	}

	async findById({ id }: { id: string }): Promise<Subscription | null> {
		const [subscription] = await this.drizzle
			.select()
			.from(subscriptions)
			.where(eq(subscriptions.id, id));

		return subscription ?? null;
	}

	async findByUserId({
		userId,
	}: {
		userId: string;
	}): Promise<Subscription | null> {
		const [subscription] = await this.drizzle
			.select()
			.from(subscriptions)
			.where(eq(subscriptions.userId, userId))
			.orderBy(desc(subscriptions.createdAt));

		return subscription ?? null;
	}

	async findByStripeSubscriptionId({
		stripeSubscriptionId,
	}: {
		stripeSubscriptionId: string;
	}): Promise<Subscription | null> {
		const [subscription] = await this.drizzle
			.select()
			.from(subscriptions)
			.where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));

		return subscription ?? null;
	}

	async update({
		id,
		data,
	}: UpdateSubscriptionParams): Promise<Subscription | null> {
		const [updatedSubscription] = await this.drizzle
			.update(subscriptions)
			.set({
				...data,
			})
			.where(eq(subscriptions.id, id))
			.returning();

		return updatedSubscription ?? null;
	}

	async delete({ id }: { id: string }): Promise<void> {
		await this.drizzle.delete(subscriptions).where(eq(subscriptions.id, id));
	}
}

