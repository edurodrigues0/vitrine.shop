import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { products } from "./products";
import { stores } from "./stores";

export const categories = pgTable("categories", {
	id: uuid("id").defaultRandom().primaryKey(),
	storeId: uuid("store_id"),
	name: varchar("name", { length: 120 }).notNull(),
	slug: varchar("slug", { length: 120 }).notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export const categoriesRelations = relations(categories, ({ one, many }) => ({
	store: one(stores, {
		fields: [categories.storeId],
		references: [stores.id],
	}),
	products: many(products),
}));
