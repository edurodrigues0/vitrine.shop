import { beforeEach, describe, expect, it } from "vitest";
import { InMemorySubscriptionsRepository } from "~/repositories/in-memory/in-memory-subscriptions-repository";
import { FindSubscriptionByStoreIdUseCase } from "./find-subscription-by-store-id";

describe("FindSubscriptionByStoreIdUseCase", () => {
	let subscriptionsRepository: InMemorySubscriptionsRepository;
	let sut: FindSubscriptionByStoreIdUseCase;

	beforeEach(() => {
		subscriptionsRepository = new InMemorySubscriptionsRepository();
		sut = new FindSubscriptionByStoreIdUseCase(subscriptionsRepository);
	});

	it("should be able to find subscription by store id", async () => {
		const storeId = crypto.randomUUID();

		const createdSubscription = await subscriptionsRepository.create({
			storeId,
			planName: "Basic Plan",
			planId: "price_123",
			provider: "stripe",
			currentPeriodStart: new Date(),
			currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			price: "29.99",
			status: "PAID",
		});

		const { subscription } = await sut.execute({ storeId });

		expect(subscription).toBeTruthy();
		expect(subscription?.id).toBe(createdSubscription.id);
		expect(subscription?.storeId).toBe(storeId);
	});

	it("should return null when subscription not found", async () => {
		const storeId = crypto.randomUUID();

		const { subscription } = await sut.execute({ storeId });

		expect(subscription).toBeNull();
	});
});

