import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { stores } from "./stores";

export const storeVisits = pgTable("store_visits", {
	id: uuid("id").defaultRandom().primaryKey(),
	storeId: uuid("store_id")
		.references(() => stores.id, { onDelete: "cascade" })
		.notNull(),
	visitedAt: timestamp("visited_at").defaultNow().notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
});

export const storeVisitsRelations = relations(storeVisits, ({ one }) => ({
	store: one(stores, {
		fields: [storeVisits.storeId],
		references: [stores.id],
	}),
}));

export type StoreVisit = typeof storeVisits.$inferSelect;

