import { DrizzleORM } from "~/database/connection";
import { DrizzleUsersRepository } from "~/repositories/drizzle/users-repository";
import { FindUserByEmailUseCase } from "~/use-cases/users/find-user-by-email";

export function makeFindUserByEmailUseCase() {
	const usersRepository = new DrizzleUsersRepository(DrizzleORM);
	const useCase = new FindUserByEmailUseCase(usersRepository);

	return useCase;
}
