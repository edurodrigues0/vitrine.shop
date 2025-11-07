import type { Notification } from "~/database/schema";
import type { NotificationsRepository } from "~/repositories/notifications-repository";
import { sseService } from "~/services/sse-service";

interface CreateNotificationUseCaseRequest {
	userId: string;
	type: "NEW_ORDER" | "ORDER_STATUS_CHANGED" | "LOW_STOCK" | "PRODUCT_ADDED" | "STORE_UPDATED" | "SYSTEM";
	title: string;
	message: string;
	relatedId?: string;
	relatedType?: string;
}

interface CreateNotificationUseCaseResponse {
	notification: Notification;
}

export class CreateNotificationUseCase {
	constructor(
		private readonly notificationsRepository: NotificationsRepository,
	) {}

	async execute({
		userId,
		type,
		title,
		message,
		relatedId,
		relatedType,
	}: CreateNotificationUseCaseRequest): Promise<CreateNotificationUseCaseResponse> {
		const notification = await this.notificationsRepository.create({
			userId,
			type,
			title,
			message,
			relatedId,
			relatedType,
		});

		// Enviar notificação via SSE em tempo real
		sseService.sendNotification(userId, {
			type,
			title,
			message,
			notificationId: notification.id,
			relatedId: relatedId ?? undefined,
			relatedType: relatedType ?? undefined,
		});

		return { notification };
	}
}

