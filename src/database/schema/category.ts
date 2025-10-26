import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { products } from "./products";

export const categories = pgTable("categories", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: varchar("name", { length: 120 }).notNull(),
	slug: varchar("slug", { length: 120 }).notNull().unique(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export const categoriesRelations = relations(categories, ({ many }) => ({
	products: many(products),
}));
