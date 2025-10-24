import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUsersRepository } from "~/repositories/in-memory/in-memory-users-repository";
import { GetUserByEmailUseCase } from "./get-user-by-email";

describe("GetUserByEmailUseCase", () => {
	let usersRepository: InMemoryUsersRepository;
	let sut: GetUserByEmailUseCase;

	beforeEach(() => {
		usersRepository = new InMemoryUsersRepository();
		sut = new GetUserByEmailUseCase(usersRepository);
	});

	it("should be able to get a user by email", async () => {
		const user = await usersRepository.create({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		const foundUser = await sut.execute({ email: user.email });

		expect(foundUser?.user).toEqual(user);
		expect(foundUser?.user?.id).toEqual(expect.any(String));
	});

	it("should throw error when user is not found by email", async () => {
		await usersRepository.create({
			name: "John Doe",
			email: "john.doe@example.com",
			password: "123456",
			role: "PASSENGER",
		});

		const wrongEmail = "wrong-email@example.com";

		await expect(sut.execute({ email: wrongEmail })).rejects.toThrow(
			"User not found",
		);
	});
});
