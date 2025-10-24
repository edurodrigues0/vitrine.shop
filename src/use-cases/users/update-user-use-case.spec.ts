import { compare } from "bcryptjs";
import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUsersRepository } from "~/repositories/in-memory/in-memory-users-repository";
import { UpdateUserUseCase } from "./update-user-use-case";

describe("UpdateUserUseCase", () => {
	let usersRepository: InMemoryUsersRepository;
	let sut: UpdateUserUseCase;

	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		sut = new UpdateUserUseCase(usersRepository);
	});

	it("should be able to update user name", async () => {
		const user = await usersRepository.create({
			name: "John Doe",
			email: "john@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		const { user: updatedUser } = await sut.execute({
			id: user.id,
			name: "John Updated",
		});

		expect(updatedUser).toBeDefined();
		expect(updatedUser?.name).toBe("John Updated");
		expect(updatedUser?.email).toBe("john@example.com");
		expect(updatedUser?.role).toBe("PASSENGER");
	});

	it("should be able to update user email", async () => {
		const user = await usersRepository.create({
			name: "John Doe",
			email: "john@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		const { user: updatedUser } = await sut.execute({
			id: user.id,
			email: "newemail@example.com",
		});

		expect(updatedUser).toBeDefined();
		expect(updatedUser?.email).toBe("newemail@example.com");
		expect(updatedUser?.name).toBe("John Doe");
	});

	it("should be able to update user password", async () => {
		const user = await usersRepository.create({
			name: "John Doe",
			email: "john@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		const { user: updatedUser } = await sut.execute({
			id: user.id,
			password: "newpassword123",
		});

		expect(updatedUser).toBeDefined();

		// Verifica que a senha foi hasheada
		const isPasswordCorrectlyHashed = await compare(
			"newpassword123",
			updatedUser?.password || "",
		);
		expect(isPasswordCorrectlyHashed).toBe(true);

		// Verifica que não é a senha antiga
		const isOldPassword = await compare("123456", updatedUser?.password || "");
		expect(isOldPassword).toBe(false);
	});

	it("should be able to update user role", async () => {
		const user = await usersRepository.create({
			name: "John Doe",
			email: "john@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		const { user: updatedUser } = await sut.execute({
			id: user.id,
			role: "DRIVER",
		});

		expect(updatedUser).toBeDefined();
		expect(updatedUser?.role).toBe("DRIVER");
	});

	it("should be able to update multiple fields at once", async () => {
		const user = await usersRepository.create({
			name: "John Doe",
			email: "john@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		const { user: updatedUser } = await sut.execute({
			id: user.id,
			name: "Jane Smith",
			email: "jane@example.com",
			password: "newpassword",
			role: "ADMIN",
		});

		expect(updatedUser).toBeDefined();
		expect(updatedUser?.name).toBe("Jane Smith");
		expect(updatedUser?.email).toBe("jane@example.com");
		expect(updatedUser?.role).toBe("ADMIN");

		const isPasswordCorrect = await compare(
			"newpassword",
			updatedUser?.password || "",
		);
		expect(isPasswordCorrect).toBe(true);
	});

	it("should throw error when no fields are provided", async () => {
		const user = await usersRepository.create({
			name: "John Doe",
			email: "john@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		await expect(
			sut.execute({
				id: user.id,
			}),
		).rejects.toThrow("At least one field must be provided");
	});

	it("should throw error when user does not exist", async () => {
		await expect(
			sut.execute({
				id: "non-existent-id",
				name: "John Updated",
			}),
		).rejects.toThrow("User not found");
	});

	it("should update only the specified user when multiple users exist", async () => {
		const user1 = await usersRepository.create({
			name: "John Doe",
			email: "john@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		const user2 = await usersRepository.create({
			name: "Jane Doe",
			email: "jane@example.com",
			password: "123456",
			role: "DRIVER",
		});

		const user3 = await usersRepository.create({
			name: "Bob Smith",
			email: "bob@example.com",
			password: "123456",
			role: "ADMIN",
		});

		// Atualiza apenas user2
		await sut.execute({
			id: user2.id,
			name: "Jane Updated",
		});

		// Verifica que user2 foi atualizado
		const updatedUser2 = await usersRepository.findById({ id: user2.id });
		expect(updatedUser2?.name).toBe("Jane Updated");

		// Verifica que os outros não foram afetados
		const unchangedUser1 = await usersRepository.findById({ id: user1.id });
		const unchangedUser3 = await usersRepository.findById({ id: user3.id });

		expect(unchangedUser1?.name).toBe("John Doe");
		expect(unchangedUser3?.name).toBe("Bob Smith");
	});

	it("should update updatedAt timestamp", async () => {
		const user = await usersRepository.create({
			name: "John Doe",
			email: "john@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		const originalUpdatedAt = user.updatedAt;

		// Aguarda um pouco para garantir diferença no timestamp
		await new Promise((resolve) => setTimeout(resolve, 10));

		const { user: updatedUser } = await sut.execute({
			id: user.id,
			name: "John Updated",
		});

		expect(updatedUser?.updatedAt.getTime()).toBeGreaterThan(
			originalUpdatedAt.getTime(),
		);
	});
});
