import { api } from "@/lib/api-client";
import type { Notification, NotificationsResponse } from "@/dtos/notification";

export const notificationsService = {
	findAll: async (params?: {
		read?: boolean;
		limit?: number;
		page?: number;
	}): Promise<NotificationsResponse> => {
		const queryParams = new URLSearchParams();
		if (params?.read !== undefined) {
			queryParams.append("read", params.read.toString());
		}
		if (params?.limit) {
			queryParams.append("limit", params.limit.toString());
		}
		if (params?.page) {
			queryParams.append("page", params.page.toString());
		}

		const response = await api.get<NotificationsResponse>(
			`/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
		);
		return response;
	},

	markAsRead: async (id: string): Promise<Notification> => {
		const response = await api.put<{ notification: Notification }>(
			`/notifications/${id}/read`,
		);
		return response.notification;
	},

	markAllAsRead: async (): Promise<void> => {
		await api.put("/notifications/read-all");
	},

	delete: async (id: string): Promise<void> => {
		await api.delete(`/notifications/${id}`);
	},
};

