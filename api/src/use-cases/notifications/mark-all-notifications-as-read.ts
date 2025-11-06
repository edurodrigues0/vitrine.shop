import type { NotificationsRepository } from "~/repositories/notifications-repository";

interface MarkAllNotificationsAsReadUseCaseRequest {
	userId: string;
}

export class MarkAllNotificationsAsReadUseCase {
	constructor(
		private readonly notificationsRepository: NotificationsRepository,
	) {}

	async execute({
		userId,
	}: MarkAllNotificationsAsReadUseCaseRequest): Promise<void> {
		await this.notificationsRepository.markAllAsRead({ userId });
	}
}

