import { DrizzleORM } from "~/database/connection";
import { DrizzleNotificationsRepository } from "~/repositories/drizzle/notifications-repository";
import { DeleteNotificationUseCase } from "~/use-cases/notifications/delete-notification";

export function makeDeleteNotificationUseCase() {
	const notificationsRepository = new DrizzleNotificationsRepository(DrizzleORM);
	return new DeleteNotificationUseCase(notificationsRepository);
}

