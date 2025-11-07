import { DrizzleORM } from "~/database/connection";
import { DrizzleNotificationsRepository } from "~/repositories/drizzle/notifications-repository";
import { CreateNotificationUseCase } from "~/use-cases/notifications/create-notification";

export function makeCreateNotificationUseCase() {
	const notificationsRepository = new DrizzleNotificationsRepository(DrizzleORM);
	return new CreateNotificationUseCase(notificationsRepository);
}

