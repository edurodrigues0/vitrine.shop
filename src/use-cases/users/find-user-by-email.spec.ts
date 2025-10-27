import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUsersRepository } from "~/repositories/in-memory/in-memory-users-repository";
import { UserNotFoundError } from "../@errors/users/user-not-found-error";
import { FindUserByEmailUseCase } from "./find-user-by-email";

describe("FindUserByEmailUseCase", () => {
	let usersRepository: InMemoryUsersRepository;
	let sut: FindUserByEmailUseCase;

	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		sut = new FindUserByEmailUseCase(usersRepository);
	});

	it("should be able to find a user by email", async () => {
		await usersRepository.create({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "hashed_password",
			role: "OWNER",
		});

		const { user } = await sut.execute({
			email: "john.doe@example.com",
		});

		expect(user).toBeTruthy();
		expect(user?.id).toEqual(expect.any(String));
		expect(user?.name).toBe("John Doe");
		expect(user?.email).toBe("john.doe@example.com");
		expect(user?.role).toBe("OWNER");
	});

	it("should throw an error when user is not found", async () => {
		await expect(
			sut.execute({
				email: "nonexistent@example.com",
			}),
		).rejects.toBeInstanceOf(UserNotFoundError);
	});

	it("should find the correct user when multiple users exist", async () => {
		await usersRepository.create({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "hashed_password",
			role: "OWNER",
		});

		await usersRepository.create({
			name: "Jane Doe",
			email: "jane.doe@example.com",
			password: "hashed_password",
			role: "EMPLOYEE",
		});

		const { user } = await sut.execute({
			email: "jane.doe@example.com",
		});

		expect(user?.name).toBe("Jane Doe");
		expect(user?.email).toBe("jane.doe@example.com");
		expect(user?.role).toBe("EMPLOYEE");
	});

	it("should return user with passwordHash field", async () => {
		await usersRepository.create({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "hashed_password_123",
			role: "OWNER",
		});

		const { user } = await sut.execute({
			email: "john.doe@example.com",
		});

		expect(user?.passwordHash).toBe("hashed_password_123");
	});
});
