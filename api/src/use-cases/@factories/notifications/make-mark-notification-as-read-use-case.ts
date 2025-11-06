import { DrizzleORM } from "~/database/connection";
import { DrizzleNotificationsRepository } from "~/repositories/drizzle/notifications-repository";
import { MarkNotificationAsReadUseCase } from "~/use-cases/notifications/mark-notification-as-read";

export function makeMarkNotificationAsReadUseCase() {
	const notificationsRepository = new DrizzleNotificationsRepository(DrizzleORM);
	return new MarkNotificationAsReadUseCase(notificationsRepository);
}

