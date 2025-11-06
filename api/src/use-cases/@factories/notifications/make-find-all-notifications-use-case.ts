import { DrizzleORM } from "~/database/connection";
import { DrizzleNotificationsRepository } from "~/repositories/drizzle/notifications-repository";
import { FindAllNotificationsUseCase } from "~/use-cases/notifications/find-all-notifications";

export function makeFindAllNotificationsUseCase() {
	const notificationsRepository = new DrizzleNotificationsRepository(DrizzleORM);
	return new FindAllNotificationsUseCase(notificationsRepository);
}

