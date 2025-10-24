import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUsersRepository } from "~/repositories/in-memory/in-memory-users-repository";
import { DeleteUserUseCase } from "./delete-user-use-case";

describe("DeleteUserUseCase", () => {
	let usersRepository: InMemoryUsersRepository;
	let sut: DeleteUserUseCase;

	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		sut = new DeleteUserUseCase(usersRepository);
	});

	it("should be able to delete a user", async () => {
		const user = await usersRepository.create({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		expect(usersRepository.items).toHaveLength(1);

		await sut.execute({ id: user.id });

		expect(usersRepository.items).toHaveLength(0);

		const deletedUser = await usersRepository.findById({ id: user.id });
		expect(deletedUser).toBeNull();
	});

	it("should delete only the specified user when multiple users exist", async () => {
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

		expect(usersRepository.items).toHaveLength(3);

		await sut.execute({ id: user2.id });

		expect(usersRepository.items).toHaveLength(2);

		const deletedUser = await usersRepository.findById({ id: user2.id });
		expect(deletedUser).toBeNull();

		const existingUser1 = await usersRepository.findById({ id: user1.id });
		const existingUser3 = await usersRepository.findById({ id: user3.id });

		expect(existingUser1).toBeDefined();
		expect(existingUser3).toBeDefined();
		expect(existingUser1?.email).toBe("john@example.com");
		expect(existingUser3?.email).toBe("bob@example.com");
	});

	it("should not throw error when trying to delete non-existent user", async () => {
		await usersRepository.create({
			name: "John Doe",
			email: "john@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		const nonExistentId = "non-existent-id";

		await expect(sut.execute({ id: nonExistentId })).rejects.toThrow(
			"User not found",
		);

		expect(usersRepository.items).toHaveLength(1);
	});
});
