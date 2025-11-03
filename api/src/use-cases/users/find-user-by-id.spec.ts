import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUsersRepository } from "~/repositories/in-memory/in-memory-users-repository";
import { UserNotFoundError } from "../@errors/users/user-not-found-error";
import { FindUserByIdUseCase } from "./find-user-by-id";

describe("FindUserByEmailUseCase", () => {
	let usersRepository: InMemoryUsersRepository;
	let sut: FindUserByIdUseCase;

	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		sut = new FindUserByIdUseCase(usersRepository);
	});

	it("should be able to find a user by email", async () => {
		const createdUser = await usersRepository.create({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "hashed_password",
			role: "OWNER",
		});

		const { user } = await sut.execute({
			id: createdUser.id,
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
				id: "nonexistent-user-id",
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

		const createdUser = await usersRepository.create({
			name: "Jane Doe",
			email: "jane.doe@example.com",
			password: "hashed_password",
			role: "EMPLOYEE",
		});

		const { user } = await sut.execute({
			id: createdUser.id,
		});

		expect(user?.name).toBe("Jane Doe");
		expect(user?.email).toBe("jane.doe@example.com");
		expect(user?.role).toBe("EMPLOYEE");
	});
});
