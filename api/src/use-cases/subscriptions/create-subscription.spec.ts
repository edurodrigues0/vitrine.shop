import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStoresRepository } from "~/repositories/in-memory/in-memory-stores-repository";
import { InMemorySubscriptionsRepository } from "~/repositories/in-memory/in-memory-subscriptions-repository";
import { InMemoryCitiesRepository } from "~/repositories/in-memory/in-memory-cities-repository";
import { StoreNotFoundError } from "../@errors/stores/store-not-found-error";
import { CreateSubscriptionUseCase } from "./create-subscription";

describe("CreateSubscriptionUseCase", () => {
	let citiesRepository: InMemoryCitiesRepository;
	let storesRepository: InMemoryStoresRepository;
	let subscriptionsRepository: InMemorySubscriptionsRepository;
	let sut: CreateSubscriptionUseCase;

	beforeEach(() => {
		citiesRepository = new InMemoryCitiesRepository();
		storesRepository = new InMemoryStoresRepository(citiesRepository);
		subscriptionsRepository = new InMemorySubscriptionsRepository();
		sut = new CreateSubscriptionUseCase(
			subscriptionsRepository,
			storesRepository,
		);
	});

	it("should be able to create a new subscription", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();

		// Criar loja primeiro
		const store = await storesRepository.create({
			name: "Test Store",
			cnpjcpf: "12345678901234",
			whatsapp: "31999999999",
			slug: "test-store",
			cityId,
			ownerId,
		});

		const { subscription } = await sut.execute({
			storeId: store.id,
			planName: "Basic Plan",
			planId: "price_123",
			provider: "stripe",
			currentPeriodStart: new Date(),
			currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			price: "29.99",
			status: "PAID",
		});

		expect(subscription).toBeTruthy();
		expect(subscription.id).toBeTruthy();
		expect(subscription.storeId).toBe(store.id);
		expect(subscription.planName).toBe("Basic Plan");
		expect(subscription.status).toBe("PAID");
	});

	it("should not create subscription for non-existent store", async () => {
		const storeId = crypto.randomUUID();

		await expect(
			sut.execute({
				storeId,
				planName: "Basic Plan",
				planId: "price_123",
				provider: "stripe",
				currentPeriodStart: new Date(),
				currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
				price: "29.99",
			}),
		).rejects.toBeInstanceOf(StoreNotFoundError);
	});

	it("should update store isPaid to true when subscription status is PAID", async () => {
		const cityId = crypto.randomUUID();
		const ownerId = crypto.randomUUID();
		const storeId = crypto.randomUUID();

		// Criar loja primeiro
		const store = await storesRepository.create({
			name: "Test Store",
			cnpjcpf: "12345678901234",
			whatsapp: "31999999999",
			slug: "test-store",
			cityId,
			ownerId,
		});

		expect(store.isPaid).toBe(false);

		await sut.execute({
			storeId: store.id,
			planName: "Basic Plan",
			planId: "price_123",
			provider: "stripe",
			currentPeriodStart: new Date(),
			currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			price: "29.99",
			status: "PAID",
		});

		const updatedStore = await storesRepository.findById({ id: store.id });
		expect(updatedStore?.isPaid).toBe(true);
	});
});

