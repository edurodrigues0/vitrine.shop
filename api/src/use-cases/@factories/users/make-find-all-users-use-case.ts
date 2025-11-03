import { DrizzleORM } from "~/database/connection";
import { DrizzleUsersRepository } from "~/repositories/drizzle/users-repository";
import { FindAllUsersUseCase } from "~/use-cases/users/find-all-users";

export function makeFindAllUsersUseCase() {
	const usersRepository = new DrizzleUsersRepository(DrizzleORM);
	const useCase = new FindAllUsersUseCase(usersRepository);

	return useCase;
}
