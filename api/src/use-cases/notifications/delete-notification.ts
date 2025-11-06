import type { NotificationsRepository } from "~/repositories/notifications-repository";

interface DeleteNotificationUseCaseRequest {
	id: string;
}

export class DeleteNotificationUseCase {
	constructor(
		private readonly notificationsRepository: NotificationsRepository,
	) {}

	async execute({ id }: DeleteNotificationUseCaseRequest): Promise<void> {
		await this.notificationsRepository.delete({ id });
	}
}

