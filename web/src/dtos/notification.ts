export type NotificationType = "NEW_ORDER" | "ORDER_STATUS_CHANGED" | "LOW_STOCK" | "PRODUCT_ADDED" | "STORE_UPDATED" | "SYSTEM";

export interface Notification {
	id: string;
	userId: string;
	type: NotificationType;
	title: string;
	message: string;
	read: boolean;
	relatedId?: string | null;
	relatedType?: string | null;
	createdAt: string;
	readAt?: string | null;
}

export interface NotificationsResponse {
	notifications: Notification[];
	unreadCount: number;
	pagination?: {
		totalItems: number;
		totalPages: number;
		currentPage: number;
		perPage: number;
	};
}

