import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUsersRepository } from "~/repositories/in-memory/in-memory-users-repository";
import { GetUserByIdUseCase } from "./get-user-by-id-use-case";

describe("GetUserByIdUseCase", () => {
	let usersRepository: InMemoryUsersRepository;
	let sut: GetUserByIdUseCase;

	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		sut = new GetUserByIdUseCase(usersRepository);
	});

	it("should be able to get a user by id", async () => {
		const user = await usersRepository.create({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		const foundUser = await sut.execute({ id: user.id });

		expect(foundUser?.user).toEqual(user);
		expect(foundUser?.user?.id).toEqual(expect.any(String));
	});

	it("should throw error when user is not found by id", async () => {
		await usersRepository.create({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		const wrongId = "wrong-id";

		await expect(sut.execute({ id: wrongId })).rejects.toThrow(
			"User not found",
		);
	});
});
