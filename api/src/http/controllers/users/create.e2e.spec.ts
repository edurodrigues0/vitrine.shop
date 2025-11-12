import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "~/index";
import { DrizzleORM } from "~/database/connection";
import { users } from "~/database/schema";
import { eq } from "drizzle-orm";

describe("E2E: Create Account Flow", () => {
	const testEmails = ["test@example.com", "duplicate@example.com"];

	beforeAll(async () => {
		// Limpar dados de teste anteriores se necessário
		try {
			for (const email of testEmails) {
				await DrizzleORM.delete(users).where(eq(users.email, email));
			}
		} catch (error) {
			// Ignorar erros de limpeza inicial
			console.warn("Erro ao limpar dados de teste anteriores:", error);
		}
	});

	it("should create a new user account", async () => {
		const response = await request(app)
			.post("/api/users")
			.send({
				name: "Test User",
				email: "test@example.com",
				password: "password123",
				role: "OWNER",
			})
			.expect(201);

		expect(response.body).toHaveProperty("id");
		expect(typeof response.body.id).toBe("string");
		expect(response.body.id).toMatch(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
		);
	});

	it("should not create user with duplicate email", async () => {
		// Criar primeiro usuário
		await request(app)
			.post("/api/users")
			.send({
				name: "First User",
				email: "duplicate@example.com",
				password: "password123",
				role: "OWNER",
			})
			.expect(201);

		// Tentar criar segundo usuário com mesmo email
		const response = await request(app)
			.post("/api/users")
			.send({
				name: "Second User",
				email: "duplicate@example.com",
				password: "password123",
				role: "OWNER",
			})
			.expect(400);

		expect(response.body).toHaveProperty("message");
		expect(typeof response.body.message).toBe("string");
	});

	afterAll(async () => {
		// Limpar dados de teste com tratamento de erros
		try {
			for (const email of testEmails) {
				await DrizzleORM.delete(users).where(eq(users.email, email));
			}
		} catch (error) {
			// Ignorar erros de limpeza para não falhar os testes
			console.warn("Erro ao limpar dados de teste:", error);
		}
	});
});

