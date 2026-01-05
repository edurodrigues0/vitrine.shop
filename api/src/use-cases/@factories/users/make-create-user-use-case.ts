import { DrizzleORM } from "~/database/connection";
import { DrizzleStoresRepository } from "~/repositories/drizzle/stores-repository";
import { DrizzleSubscriptionsRepository } from "~/repositories/drizzle/subscriptions-repository";
import { DrizzleUsersRepository } from "~/repositories/drizzle/users-repository";
import { CreateUserUseCase } from "~/use-cases/users/create-user-use-case";

export function makeCreateUserUseCase() {
	const usersRepository = new DrizzleUsersRepository(DrizzleORM);
	const storesRepository = new DrizzleStoresRepository(DrizzleORM);
	const subscriptionsRepository = new DrizzleSubscriptionsRepository(DrizzleORM);
	const useCase = new CreateUserUseCase(
		usersRepository,
		storesRepository,
		subscriptionsRepository,
	);

	return useCase;
}
