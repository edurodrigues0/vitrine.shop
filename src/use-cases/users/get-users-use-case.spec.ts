import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUsersRepository } from "~/repositories/in-memory/in-memory-users-repository";
import { GetUsersUseCase } from "./get-users-use-case";

describe("GetUsersUseCase", () => {
	let usersRepository: InMemoryUsersRepository;
	let sut: GetUsersUseCase;

	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		sut = new GetUsersUseCase(usersRepository);
	});

	it("should be able to get users", async () => {
		for (let i = 1; i <= 12; i++) {
			await usersRepository.create({
				name: `User ${i}`,
				email: `user${i}@example.com`,
				password: `123456`,
				role: i % 3 === 0 ? "ADMIN" : i % 2 === 0 ? "DRIVER" : "PASSENGER",
			});
		}

		const { users } = await sut.execute({
			page: 2,
			limit: 10,
			filters: {},
		});

		expect(users).toHaveLength(2);
	});

	it("should be able to filters users by name", async () => {
		await usersRepository.create({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		for (let i = 1; i <= 10; i++) {
			await usersRepository.create({
				name: `User ${i}`,
				email: `user${i}@example.com`,
				password: `123456`,
				role: i % 3 === 0 ? "ADMIN" : i % 2 === 0 ? "DRIVER" : "PASSENGER",
			});
		}

		const { users } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				name: "John",
			},
		});

		expect(users).toHaveLength(1);
		expect(users[0]?.name).toBe("John Doe");
		expect(users[0]?.email).toBe("john.doe@example.com");
		expect(users[0]?.role).toBe("PASSENGER");
	});

	it("should be able to filters users by email", async () => {
		await usersRepository.create({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		for (let i = 1; i <= 10; i++) {
			await usersRepository.create({
				name: `User ${i}`,
				email: `user${i}@example.com`,
				password: `123456`,
				role: i % 3 === 0 ? "ADMIN" : i % 2 === 0 ? "DRIVER" : "PASSENGER",
			});
		}

		const { users } = await sut.execute({
			page: 1,
			limit: 10,
			filters: {
				name: "John",
			},
		});

		expect(users).toHaveLength(1);
		expect(users[0]?.name).toBe("John Doe");
		expect(users[0]?.email).toBe("john.doe@example.com");
		expect(users[0]?.role).toBe("PASSENGER");
	});
});
