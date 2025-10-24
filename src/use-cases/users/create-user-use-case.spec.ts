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
			role: "OWNER",
		});

		expect(user.id).toEqual(expect.any(String));
		expect(user.name).toBe("John Doe");
		expect(user.email).toBe("john.doe@example.com");
		expect(user.role).toBe("OWNER");
	});

	it("should be able to hash the user's password", async () => {
		const { user } = await sut.execute({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "123456",
			role: "OWNER",
		});

		const isPasswordCorrectlyHashed = await compare(
			"123456",
			user.passwordHash,
		);

		expect(isPasswordCorrectlyHashed).toBe(true);
	});

	it("should be able to create users with different roles", async () => {
		const owner = await sut.execute({
			name: "John OWNER",
			email: "owner@example.com",
			password: "123456",
			role: "OWNER",
		});

		const employee = await sut.execute({
			name: "John EMPLOYEE",
			email: "employee@example.com",
			password: "123456",
			role: "EMPLOYEE",
		});

		const admin = await sut.execute({
			name: "John Admin",
			email: "admin@example.com",
			password: "123456",
			role: "ADMIN",
		});

		expect(owner.user.role).toBe("OWNER");
		expect(employee.user.role).toBe("EMPLOYEE");
		expect(admin.user.role).toBe("ADMIN");
	});

	it("should throw error when user with same email already exists", async () => {
		await sut.execute({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "123456",
			role: "OWNER",
		});

		await expect(
			sut.execute({
				name: "John Doe",
				email: "john.doe@example.com",
				password: "123456",
				role: "OWNER",
			}),
		).rejects.toThrow("User with same email already exists");
	});
});
