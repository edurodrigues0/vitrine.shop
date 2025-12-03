import { relations } from "drizzle-orm";
import {
	decimal,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const planStatusEnum = pgEnum("plan_status", [
	"PAID",
	"PENDING",
	"CANCELLED",
	"REFUNDED",
]);

export const subscriptions = pgTable("subscriptions", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: text("user_id")
		.references(() => users.id)
		.notNull(), // text para compatibilidade com Better Auth
	planName: varchar("plan_name", { length: 100 }).notNull(),
	planId: varchar("plan_id").notNull(),
	provider: varchar("provider", { length: 100 }).notNull(),
	currentPeriodStart: timestamp("current_period_start").notNull(),
	currentPeriodEnd: timestamp("current_period_end").notNull(),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	status: planStatusEnum("status").default("PENDING").notNull(),
	nextPayment: timestamp("next_payment"),
	stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
	stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id],
	}),
}));
