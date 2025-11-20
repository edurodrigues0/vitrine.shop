import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStoresRepository } from "~/repositories/in-memory/in-memory-stores-repository";
import { InMemorySubscriptionsRepository } from "~/repositories/in-memory/in-memory-subscriptions-repository";
import { InMemoryCitiesRepository } from "~/repositories/in-memory/in-memory-cities-repository";
import { SubscriptionNotFoundError } from "../@errors/subscriptions/subscription-not-found-error";
import { UpdateSubscriptionStatusUseCase } from "./update-subscription-status";

describe("UpdateSubscriptionStatusUseCase", () => {
	let citiesRepository: InMemoryCitiesRepository;
	let storesRepository: InMemoryStoresRepository;
	let subscriptionsRepository: InMemorySubscriptionsRepository;
	let sut: UpdateSubscriptionStatusUseCase;

	beforeEach(() => {
		citiesRepository = new InMemoryCitiesRepository();
		storesRepository = new InMemoryStoresRepository(citiesRepository);
		subscriptionsRepository = new InMemorySubscriptionsRepository();
		sut = new UpdateSubscriptionStatusUseCase(
			subscriptionsRepository,
			storesRepository,
		);
	});

	it("should be able to update subscription status", async () => {
		const cityId = crypto.randomUUID();
		const userId = crypto.randomUUID();

		// Criar loja
		await storesRepository.create({
			name: "Test Store",
			cnpjcpf: "12345678901234",
			whatsapp: "31999999999",
			slug: "test-store",
			cityId,
			ownerId: userId,
		});

		// Criar subscription
		const subscription = await subscriptionsRepository.create({
			userId,
			planName: "Basic Plan",
			planId: "price_123",
			provider: "stripe",
			currentPeriodStart: new Date(),
			currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			price: "29.99",
			status: "PENDING",
		});

		const { subscription: updatedSubscription } = await sut.execute({
			id: subscription.id,
			status: "PAID",
		});

		expect(updatedSubscription.status).toBe("PAID");
	});

	it("should not update non-existent subscription", async () => {
		await expect(
			sut.execute({
				id: crypto.randomUUID(),
				status: "PAID",
			}),
		).rejects.toBeInstanceOf(SubscriptionNotFoundError);
	});

	it("should update store isPaid when subscription status changes to PAID", async () => {
		const cityId = crypto.randomUUID();
		const userId = crypto.randomUUID();

		// Criar loja
		const store = await storesRepository.create({
			name: "Test Store",
			cnpjcpf: "12345678901234",
			whatsapp: "31999999999",
			slug: "test-store",
			cityId,
			ownerId: userId,
		});

		// Criar subscription com status PENDING
		const subscription = await subscriptionsRepository.create({
			userId,
			planName: "Basic Plan",
			planId: "price_123",
			provider: "stripe",
			currentPeriodStart: new Date(),
			currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			price: "29.99",
			status: "PENDING",
		});

		expect(store.isPaid).toBe(false);

		await sut.execute({
			id: subscription.id,
			status: "PAID",
		});

		const updatedStore = await storesRepository.findById({ id: store.id });
		expect(updatedStore?.isPaid).toBe(true);
	});
});

