import { DrizzleORM } from "~/database/connection";
import { DrizzleUsersRepository } from "~/repositories/drizzle/users-repository";
import { FindUserByIdUseCase } from "~/use-cases/users/find-user-by-id";

export function makeFindUserByIdUseCase() {
	const usersRepository = new DrizzleUsersRepository(DrizzleORM);
	const useCase = new FindUserByIdUseCase(usersRepository);

	return useCase;
}
