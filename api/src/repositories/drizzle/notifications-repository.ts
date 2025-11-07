import { and, count, desc, eq } from "drizzle-orm";
import type { DrizzleORM } from "~/database/connection";
import { type Notification, notifications } from "~/database/schema";
import type {
	CreateNotificationParams,
	FindAllNotificationsParams,
	NotificationsRepository,
} from "../notifications-repository";

export class DrizzleNotificationsRepository implements NotificationsRepository {
	constructor(private readonly drizzle: typeof DrizzleORM) {}

	async create({
		userId,
		type,
		title,
		message,
		relatedId,
		relatedType,
	}: CreateNotificationParams): Promise<Notification> {
		const [notification] = await this.drizzle
			.insert(notifications)
			.values({
				userId,
				type,
				title,
				message,
				relatedId: relatedId ?? null,
				relatedType: relatedType ?? null,
			})
			.returning();

		if (!notification) {
			throw new Error("Failed to create notification");
		}

		return notification;
	}

	async findById({ id }: { id: string }): Promise<Notification | null> {
		const [notification] = await this.drizzle
			.select()
			.from(notifications)
			.where(eq(notifications.id, id))
			.limit(1);

		return notification ?? null;
	}

	async findAll({
		userId,
		read,
		limit = 50,
		page = 1,
	}: FindAllNotificationsParams): Promise<{
		notifications: Notification[];
		unreadCount: number;
		pagination?: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}> {
		const conditions = [eq(notifications.userId, userId)];
		
		if (read !== undefined) {
			conditions.push(eq(notifications.read, read));
		}

		const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

		// Buscar notificações
		const notificationsList = await this.drizzle
			.select()
			.from(notifications)
			.where(whereClause)
			.orderBy(desc(notifications.createdAt))
			.limit(limit)
			.offset((page - 1) * limit);

		// Contar total de não lidas
		const [unreadResult] = await this.drizzle
			.select({ count: count() })
			.from(notifications)
			.where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

		const unreadCount = unreadResult?.count ?? 0;

		// Se não há paginação, retornar sem pagination
		if (!limit || limit >= 1000) {
			return {
				notifications: notificationsList,
				unreadCount,
			};
		}

		// Contar total para paginação
		const [totalResult] = await this.drizzle
			.select({ count: count() })
			.from(notifications)
			.where(whereClause);

		const totalItems = totalResult?.count ?? 0;
		const totalPages = Math.ceil(totalItems / limit);

		return {
			notifications: notificationsList,
			unreadCount,
			pagination: {
				totalItems,
				totalPages,
				currentPage: page,
				perPage: limit,
			},
		};
	}

	async markAsRead({ id }: { id: string }): Promise<Notification | null> {
		const [notification] = await this.drizzle
			.update(notifications)
			.set({
				read: true,
				readAt: new Date(),
			})
			.where(eq(notifications.id, id))
			.returning();

		return notification ?? null;
	}

	async markAllAsRead({ userId }: { userId: string }): Promise<void> {
		await this.drizzle
			.update(notifications)
			.set({
				read: true,
				readAt: new Date(),
			})
			.where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
	}

	async delete({ id }: { id: string }): Promise<void> {
		await this.drizzle.delete(notifications).where(eq(notifications.id, id));
	}

	async deleteAll({ userId }: { userId: string }): Promise<void> {
		await this.drizzle.delete(notifications).where(eq(notifications.userId, userId));
	}
}

