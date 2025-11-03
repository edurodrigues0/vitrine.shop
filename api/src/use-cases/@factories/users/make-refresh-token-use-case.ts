import { DrizzleORM } from "~/database/connection";
import { DrizzleUsersRepository } from "~/repositories/drizzle/users-repository";
import { RefreshTokenUseCase } from "~/use-cases/users/refresh-token";

export function makeRefreshTokenUseCase() {
	const usersRepository = new DrizzleUsersRepository(DrizzleORM);
	return new RefreshTokenUseCase(usersRepository);
}

