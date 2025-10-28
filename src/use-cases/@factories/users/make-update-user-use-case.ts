import { DrizzleORM } from "~/database/connection";
import { DrizzleUsersRepository } from "~/repositories/drizzle/users-repository";
import { UpdateUserUseCase } from "~/use-cases/users/update-user";

export function makeUpdateUserUseCase() {
	const usersRepository = new DrizzleUsersRepository(DrizzleORM);
	const useCase = new UpdateUserUseCase(usersRepository);

	return useCase;
}
