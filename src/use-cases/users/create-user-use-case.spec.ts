import { compare } from "bcryptjs";
import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUsersRepository } from "~/repositories/in-memory/in-memory-users-repository";
import { CreateUserUseCase } from "./create-user-use-case";

describe("CreateUserUseCase", () => {
	let usersRepository: InMemoryUsersRepository;
	let sut: CreateUserUseCase;

	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		sut = new CreateUserUseCase(usersRepository);
	});

	it("should be able to create a new user", async () => {
		const { user } = await sut.execute({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		expect(user.id).toEqual(expect.any(String));
		expect(user.name).toBe("John Doe");
		expect(user.email).toBe("john.doe@example.com");
		expect(user.role).toBe("PASSENGER");
	});

	it("should be able to hash the user's password", async () => {
		const { user } = await sut.execute({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		const isPasswordCorrectlyHashed = await compare("123456", user.password);

		expect(isPasswordCorrectlyHashed).toBe(true);
	});

	it("should be able to create users with different roles", async () => {
		const passenger = await sut.execute({
			name: "John Passenger",
			email: "passenger@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		const driver = await sut.execute({
			name: "John Driver",
			email: "driver@example.com",
			password: "123456",
			role: "DRIVER",
		});

		const admin = await sut.execute({
			name: "John Admin",
			email: "admin@example.com",
			password: "123456",
			role: "ADMIN",
		});

		expect(passenger.user.role).toBe("PASSENGER");
		expect(driver.user.role).toBe("DRIVER");
		expect(admin.user.role).toBe("ADMIN");
	});

	it("should be able to save the user in the repository", async () => {
		await sut.execute({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		expect(usersRepository.items).toHaveLength(1);
		expect(usersRepository.items[0]?.email).toBe("john.doe@example.com");
	});

	it("should throw error when user with same email already exists", async () => {
		await sut.execute({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		await expect(
			sut.execute({
				name: "John Doe",
				email: "john.doe@example.com",
				password: "123456",
				role: "PASSENGER",
			}),
		).rejects.toThrow("User with same email already exists");
	});
});
