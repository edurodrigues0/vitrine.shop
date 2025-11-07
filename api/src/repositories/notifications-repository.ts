import type { Notification } from "~/database/schema";

export interface CreateNotificationParams {
	userId: string;
	type: "NEW_ORDER" | "ORDER_STATUS_CHANGED" | "LOW_STOCK" | "PRODUCT_ADDED" | "STORE_UPDATED" | "SYSTEM";
	title: string;
	message: string;
	relatedId?: string;
	relatedType?: string;
}

export interface FindAllNotificationsParams {
	userId: string;
	read?: boolean;
	limit?: number;
	page?: number;
}

export interface NotificationsRepository {
	create(params: CreateNotificationParams): Promise<Notification>;
	
	findById({ id }: { id: string }): Promise<Notification | null>;
	
	findAll(params: FindAllNotificationsParams): Promise<{
		notifications: Notification[];
		unreadCount: number;
		pagination?: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}>;
	
	markAsRead({ id }: { id: string }): Promise<Notification | null>;
	
	markAllAsRead({ userId }: { userId: string }): Promise<void>;
	
	delete({ id }: { id: string }): Promise<void>;
	
	deleteAll({ userId }: { userId: string }): Promise<void>;
}

