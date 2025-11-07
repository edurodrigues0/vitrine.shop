import type { Notification } from "~/database/schema";
import type { NotificationsRepository } from "~/repositories/notifications-repository";

interface MarkNotificationAsReadUseCaseRequest {
	id: string;
}

interface MarkNotificationAsReadUseCaseResponse {
	notification: Notification;
}

export class MarkNotificationAsReadUseCase {
	constructor(
		private readonly notificationsRepository: NotificationsRepository,
	) {}

	async execute({
		id,
	}: MarkNotificationAsReadUseCaseRequest): Promise<MarkNotificationAsReadUseCaseResponse> {
		const notification = await this.notificationsRepository.markAsRead({ id });

		if (!notification) {
			throw new Error("Notification not found");
		}

		return { notification };
	}
}

