import { relations } from "drizzle-orm";
import {
	boolean,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { addresses } from "./addresses";
import { cities } from "./cities";
import { stores } from "./stores";

export const storeBranches = pgTable("store_branches", {
	id: uuid("id").defaultRandom().primaryKey(),
	parentStoreId: uuid("parent_store_id")
		.references(() => stores.id, { onDelete: "cascade" })
		.notNull(),
	name: varchar("name", { length: 120 }).notNull(),
	cityId: uuid("city_id")
		.references(() => cities.id)
		.notNull(),
	isMain: boolean("is_main").default(false).notNull(),
	whatsapp: varchar("whatsapp", { length: 20 }),
	description: text("description"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type StoreBranch = typeof storeBranches.$inferSelect;
export type NewStoreBranch = typeof storeBranches.$inferInsert;

export const storeBranchesRelations = relations(storeBranches, ({ one, many }) => ({
	parentStore: one(stores, {
		fields: [storeBranches.parentStoreId],
		references: [stores.id],
	}),
	city: one(cities, {
		fields: [storeBranches.cityId],
		references: [cities.id],
	}),
	addresses: many(addresses),
}));

