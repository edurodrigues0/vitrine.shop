import { beforeEach, describe, expect, it } from "vitest";
import { InMemorySubscriptionsRepository } from "~/repositories/in-memory/in-memory-subscriptions-repository";
import { FindSubscriptionByUserIdUseCase } from "./find-subscription-by-user-id";

describe("FindSubscriptionByUserIdUseCase", () => {
	let subscriptionsRepository: InMemorySubscriptionsRepository;
	let sut: FindSubscriptionByUserIdUseCase;

	beforeEach(() => {
		subscriptionsRepository = new InMemorySubscriptionsRepository();
		sut = new FindSubscriptionByUserIdUseCase(subscriptionsRepository);
	});

	it("should be able to find subscription by user id", async () => {
		const userId = crypto.randomUUID();

		const createdSubscription = await subscriptionsRepository.create({
			userId,
			planName: "Basic Plan",
			planId: "price_123",
			provider: "stripe",
			currentPeriodStart: new Date(),
			currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			price: "29.99",
			status: "PAID",
		});

		const { subscription } = await sut.execute({ userId });

		expect(subscription).toBeTruthy();
		expect(subscription?.id).toBe(createdSubscription.id);
		expect(subscription?.userId).toBe(userId);
	});

	it("should return null when subscription not found", async () => {
		const userId = crypto.randomUUID();

		const { subscription } = await sut.execute({ userId });

		expect(subscription).toBeNull();
	});
});

