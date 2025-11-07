import type { Notification } from "~/database/schema";
import type { NotificationsRepository } from "~/repositories/notifications-repository";

interface FindAllNotificationsUseCaseRequest {
	userId: string;
	read?: boolean;
	limit?: number;
	page?: number;
}

interface FindAllNotificationsUseCaseResponse {
	notifications: Notification[];
	unreadCount: number;
	pagination?: {
		totalItems: number;
		totalPages: number;
		currentPage: number;
		perPage: number;
	};
}

export class FindAllNotificationsUseCase {
	constructor(
		private readonly notificationsRepository: NotificationsRepository,
	) {}

	async execute({
		userId,
		read,
		limit,
		page,
	}: FindAllNotificationsUseCaseRequest): Promise<FindAllNotificationsUseCaseResponse> {
		const result = await this.notificationsRepository.findAll({
			userId,
			read,
			limit,
			page,
		});

		return result;
	}
}

