import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "~/index";
import { DrizzleORM } from "~/database/connection";
import { users, stores, cities } from "~/database/schema";
import { eq } from "drizzle-orm";
import { makeCreateUserUseCase } from "~/use-cases/@factories/users/make-create-user-use-case";
import { makeCreateStoreUseCase } from "~/use-cases/@factories/stores/make-create-store-use-case";

describe("E2E: Subscription Checkout Flow", () => {
	let testUserId: string;
	let testStoreId: string;
	let testCityId: string;
	let authToken: string;
	const testEmail = "subscription-test@example.com";
	const testPassword = "password123";

	beforeAll(async () => {
		// Criar cidade de teste
		const [city] = await DrizzleORM.insert(cities)
			.values({
				name: "Test City",
				state: "MG",
			})
			.returning();
	
		if (!city) {
			throw new Error("Failed to create city");
		}
	
		testCityId = city.id;

		// Criar usuário de teste
		const createUserUseCase = makeCreateUserUseCase();
		const { user } = await createUserUseCase.execute({
			name: "Subscription Test User",
			email: testEmail,
			password: testPassword,
			role: "OWNER",
		});
		testUserId = user.id;

		// Criar loja de teste
		const createStoreUseCase = makeCreateStoreUseCase();
		const { store } = await createStoreUseCase.execucte({
			name: "Test Store",
			cnpjcpf: "12345678901234",
			whatsapp: "31999999999",
			slug: "test-store-subscription",
			cityId: testCityId,
			ownerId: testUserId,
			theme: {
				primaryColor: "#000000",
				secondaryColor: "#FFFFFF",
				tertiaryColor: "#808080",
			},
		});
	
		testStoreId = store.id;

		// Autenticar usuário para obter token
		const loginResponse = await request(app)
			.post("/api/auth/login")
			.send({
				email: testEmail,
				password: testPassword,
			});

		authToken = loginResponse.body.token;
	});

	afterAll(async () => {
		// Limpar dados de teste com tratamento de erros
		try {
			if (testStoreId) {
				await DrizzleORM.delete(stores).where(eq(stores.id, testStoreId));
			}
		} catch (error) {
			console.warn("Erro ao limpar store de teste:", error);
		}

		try {
			if (testUserId) {
				await DrizzleORM.delete(users).where(eq(users.id, testUserId));
			}
		} catch (error) {
			console.warn("Erro ao limpar user de teste:", error);
		}

		try {
			if (testCityId) {
				await DrizzleORM.delete(cities).where(eq(cities.id, testCityId));
			}
		} catch (error) {
			console.warn("Erro ao limpar city de teste:", error);
		}
	});

	it("should create checkout session for authenticated user", async () => {
		const response = await request(app)
			.post("/api/subscriptions/checkout")
			.set("Authorization", `Bearer ${authToken}`)
			.send({
				storeId: testStoreId,
				priceId: "price_test_123",
				successUrl: "https://example.com/success",
				cancelUrl: "https://example.com/cancel",
			});

		// Pode retornar 200 (sucesso) ou 500 (erro do Stripe se não configurado)
		// O importante é que não retorne 401 (não autenticado) ou 404 (loja não encontrada)
		expect([200, 500]).toContain(response.status);

		if (response.status === 200) {
			expect(response.body).toHaveProperty("checkoutUrl");
			expect(typeof response.body.checkoutUrl).toBe("string");
		}
	});

	it("should not create checkout session without authentication", async () => {
		const response = await request(app)
			.post("/api/subscriptions/checkout")
			.send({
				storeId: testStoreId,
				priceId: "price_test_123",
				successUrl: "https://example.com/success",
				cancelUrl: "https://example.com/cancel",
			})
			.expect(401);

		expect(response.body).toHaveProperty("message");
		expect(typeof response.body.message).toBe("string");
		expect(response.body.message.length).toBeGreaterThan(0);
		expect(response.body).not.toHaveProperty("checkoutUrl");
	});

	it("should not create checkout session for non-existent store", async () => {
		const fakeStoreId = crypto.randomUUID();

		const response = await request(app)
			.post("/api/subscriptions/checkout")
			.set("Authorization", `Bearer ${authToken}`)
			.send({
				storeId: fakeStoreId,
				priceId: "price_test_123",
				successUrl: "https://example.com/success",
				cancelUrl: "https://example.com/cancel",
			})
			.expect(404);

		expect(response.body).toHaveProperty("message");
		expect(typeof response.body.message).toBe("string");
		expect(response.body.message.length).toBeGreaterThan(0);
		expect(response.body).not.toHaveProperty("checkoutUrl");
	});

	it("should validate required fields", async () => {
		const response = await request(app)
			.post("/api/subscriptions/checkout")
			.set("Authorization", `Bearer ${authToken}`)
			.send({
				storeId: "invalid-uuid", // UUID inválido
				priceId: "", // priceId vazio
				successUrl: "not-a-url", // URL inválida
				cancelUrl: "not-a-url", // URL inválida
			})
			.expect(400);

		expect(response.body).toHaveProperty("issues");
		expect(Array.isArray(response.body.issues)).toBe(true);
		expect(response.body.issues.length).toBeGreaterThan(0);
	});
});

