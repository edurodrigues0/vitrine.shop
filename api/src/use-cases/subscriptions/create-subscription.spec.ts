import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryStoresRepository } from "~/repositories/in-memory/in-memory-stores-repository";
import { InMemorySubscriptionsRepository } from "~/repositories/in-memory/in-memory-subscriptions-repository";
import { InMemoryCitiesRepository } from "~/repositories/in-memory/in-memory-cities-repository";
import { InMemoryUsersRepository } from "~/repositories/in-memory/in-memory-users-repository";
import { UserNotFoundError } from "../@errors/users/user-not-found-error";
import { CreateSubscriptionUseCase } from "./create-subscription";

describe("CreateSubscriptionUseCase", () => {
	let citiesRepository: InMemoryCitiesRepository;
	let storesRepository: InMemoryStoresRepository;
	let usersRepository: InMemoryUsersRepository;
	let subscriptionsRepository: InMemorySubscriptionsRepository;
	let sut: CreateSubscriptionUseCase;

	beforeEach(() => {
		citiesRepository = new InMemoryCitiesRepository();
		storesRepository = new InMemoryStoresRepository(citiesRepository);
		usersRepository = new InMemoryUsersRepository();
		subscriptionsRepository = new InMemorySubscriptionsRepository();
		sut = new CreateSubscriptionUseCase(
			subscriptionsRepository,
			storesRepository,
			usersRepository,
		);
	});

	it("should be able to create a new subscription", async () => {
		// Criar usuário primeiro
		const user = await usersRepository.create({
			name: "Test User",
			email: "test@example.com",
			password: "hashed_password",
			role: "OWNER",
		});

		const { subscription } = await sut.execute({
			userId: user.id,
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
		expect(subscription.userId).toBe(user.id);
		expect(subscription.planName).toBe("Basic Plan");
		expect(subscription.status).toBe("PAID");
	});

	it("should not create subscription for non-existent user", async () => {
		const userId = crypto.randomUUID();

		await expect(
			sut.execute({
				userId,
				planName: "Basic Plan",
				planId: "price_123",
				provider: "stripe",
				currentPeriodStart: new Date(),
				currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
				price: "29.99",
			}),
		).rejects.toBeInstanceOf(UserNotFoundError);
	});

	it("should update store isPaid to true when subscription status is PAID", async () => {
		const cityId = crypto.randomUUID();

		// Criar usuário
		const user = await usersRepository.create({
			name: "Test User",
			email: "test@example.com",
			password: "hashed_password",
			role: "OWNER",
		});

		// Criar loja do usuário
		const store = await storesRepository.create({
			name: "Test Store",
			cnpjcpf: "12345678901234",
			whatsapp: "31999999999",
			slug: "test-store",
			cityId,
			ownerId: user.id,
		});

		expect(store.isPaid).toBe(false);

		await sut.execute({
			userId: user.id,
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

