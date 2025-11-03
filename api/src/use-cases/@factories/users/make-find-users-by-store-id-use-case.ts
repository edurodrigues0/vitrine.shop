import { DrizzleORM } from "~/database/connection";
import { DrizzleUsersRepository } from "~/repositories/drizzle/users-repository";
import { FindUserByStoreIdUseCase } from "~/use-cases/users/find-users-by-store-id";

export function makeFindUsersByStoreIdUseCase() {
	const usersRepository = new DrizzleUsersRepository(DrizzleORM);
	const useCase = new FindUserByStoreIdUseCase(usersRepository);

	return useCase;
}
