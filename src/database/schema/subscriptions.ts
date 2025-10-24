import { relations } from "drizzle-orm";
import {
	decimal,
	pgEnum,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { stores } from "./store";

export const planStatusEnum = pgEnum("plan_status", [
	"PAID",
	"PENDING",
	"CANCELLED",
]);

export const subscriptions = pgTable("subscriptions", {
	id: uuid("id").defaultRandom().primaryKey(),
	storeId: uuid("store_id")
		.references(() => stores.id)
		.notNull(),
	planName: varchar("plan_name", { length: 100 }).notNull(),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	status: planStatusEnum("status").default("PENDING").notNull(),
	nextPayment: timestamp("next_payment"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
	store: one(stores, {
		fields: [subscriptions.storeId],
		references: [stores.id],
	}),
}));
