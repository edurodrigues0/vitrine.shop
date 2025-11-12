import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "~/index";
import { DrizzleORM } from "~/database/connection";
import { users } from "~/database/schema";
import { eq } from "drizzle-orm";
import { makeCreateUserUseCase } from "~/use-cases/@factories/users/make-create-user-use-case";

describe("E2E: Authentication Flow", () => {
	const testEmail = "auth-test@example.com";
	const testPassword = "password123";

	beforeAll(async () => {
		// Criar usuário de teste para autenticação
		const createUserUseCase = makeCreateUserUseCase();
		await createUserUseCase.execute({
			name: "Auth Test User",
			email: testEmail,
			password: testPassword,
			role: "OWNER",
		});
	});

	afterAll(async () => {
		// Limpar dados de teste com tratamento de erros
		try {
			await DrizzleORM.delete(users).where(eq(users.email, testEmail));
		} catch (error) {
			// Ignorar erros de limpeza para não falhar os testes
			console.warn("Erro ao limpar dados de teste:", error);
		}
	});

	it("should authenticate user with valid credentials", async () => {
		const response = await request(app)
			.post("/api/auth/login")
			.send({
				email: testEmail,
				password: testPassword,
			})
			.expect(200);

		expect(response.body).toHaveProperty("user");
		expect(response.body).toHaveProperty("token");
		expect(typeof response.body.token).toBe("string");
		expect(response.body.token.length).toBeGreaterThan(0);

		expect(response.body.user).toHaveProperty("id");
		expect(typeof response.body.user.id).toBe("string");
		expect(response.body.user.id).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
		);
		expect(response.body.user).toHaveProperty("email", testEmail);
		expect(response.body.user).toHaveProperty("name", "Auth Test User");
		expect(response.body.user).toHaveProperty("role", "OWNER");

		// Verificar se o cookie foi definido
		const cookies = response.headers["set-cookie"];
		expect(cookies).toBeDefined();
		expect(Array.isArray(cookies)).toBe(true);
		expect(cookies?.some((cookie: string) => cookie.includes("auth-token"))).toBe(
			true,
		);
	});

	it("should not authenticate with invalid email", async () => {
		const response = await request(app)
			.post("/api/auth/login")
			.send({
				email: "nonexistent@example.com",
				password: testPassword,
			})
			.expect(401);

		expect(response.body).toHaveProperty("error");
		expect(typeof response.body.error).toBe("string");
		expect(response.body.error.length).toBeGreaterThan(0);
		expect(response.body).not.toHaveProperty("token");
		expect(response.body).not.toHaveProperty("user");
	});

	it("should not authenticate with invalid password", async () => {
		const response = await request(app)
			.post("/api/auth/login")
			.send({
				email: testEmail,
				password: "wrongpassword",
			})
			.expect(401);

		expect(response.body).toHaveProperty("error");
		expect(typeof response.body.error).toBe("string");
		expect(response.body.error.length).toBeGreaterThan(0);
		expect(response.body).not.toHaveProperty("token");
		expect(response.body).not.toHaveProperty("user");
	});

	it("should validate required fields", async () => {
		const response = await request(app)
			.post("/api/auth/login")
			.send({
				email: "invalid-email", // email inválido
				password: "short", // senha muito curta
			})
			.expect(400);

		expect(response.body).toHaveProperty("error");
		expect(response.body).toHaveProperty("issues");
		expect(Array.isArray(response.body.issues)).toBe(true);
		expect(response.body.issues.length).toBeGreaterThan(0);
	});
});

