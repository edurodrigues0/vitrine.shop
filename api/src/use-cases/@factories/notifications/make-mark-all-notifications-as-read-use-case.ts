import { DrizzleORM } from "~/database/connection";
import { DrizzleNotificationsRepository } from "~/repositories/drizzle/notifications-repository";
import { MarkAllNotificationsAsReadUseCase } from "~/use-cases/notifications/mark-all-notifications-as-read";

export function makeMarkAllNotificationsAsReadUseCase() {
	const notificationsRepository = new DrizzleNotificationsRepository(DrizzleORM);
	return new MarkAllNotificationsAsReadUseCase(notificationsRepository);
}

