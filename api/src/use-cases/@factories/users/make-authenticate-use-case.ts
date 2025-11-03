import { DrizzleORM } from "~/database/connection";
import { DrizzleUsersRepository } from "~/repositories/drizzle/users-repository";
import { AuthenticateUseCase } from "~/use-cases/users/authenticate";

export function makeAuthenticateUseCase() {
	const usersRepository = new DrizzleUsersRepository(DrizzleORM);
	return new AuthenticateUseCase(usersRepository);
}
