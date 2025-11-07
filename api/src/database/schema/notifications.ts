import { relations } from "drizzle-orm";
import {
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
	boolean,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const notificationTypeEnum = pgEnum("notification_type", [
	"NEW_ORDER",
	"ORDER_STATUS_CHANGED",
	"LOW_STOCK",
	"PRODUCT_ADDED",
	"STORE_UPDATED",
	"SYSTEM",
]);

export const notifications = pgTable("notifications", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	type: notificationTypeEnum("type").notNull(),
	title: varchar("title", { length: 200 }).notNull(),
	message: text("message").notNull(),
	read: boolean("read").default(false).notNull(),
	relatedId: uuid("related_id"), // ID do pedido, produto, etc.
	relatedType: varchar("related_type", { length: 50 }), // "order", "product", etc.
	createdAt: timestamp("created_at").defaultNow().notNull(),
	readAt: timestamp("read_at"),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export const notificationsRelations = relations(notifications, ({ one }) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id],
	}),
}));

