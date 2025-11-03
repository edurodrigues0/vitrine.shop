import { DrizzleORM } from "~/database/connection";
import { DrizzleUsersRepository } from "~/repositories/drizzle/users-repository";
import { DeleteUserUseCase } from "~/use-cases/users/delete-user";

export function makeDeleteUserUseCase() {
	const usersRepository = new DrizzleUsersRepository(DrizzleORM);
	const useCase = new DeleteUserUseCase(usersRepository);

	return useCase;
}
