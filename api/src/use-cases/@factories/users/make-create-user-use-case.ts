import { DrizzleORM } from "~/database/connection";
import { DrizzleUsersRepository } from "~/repositories/drizzle/users-repository";
import { CreateUserUseCase } from "~/use-cases/users/create-user-use-case";

export function makeCreateUserUseCase() {
	const usersRepository = new DrizzleUsersRepository(DrizzleORM);
	const useCase = new CreateUserUseCase(usersRepository);

	return useCase;
}
