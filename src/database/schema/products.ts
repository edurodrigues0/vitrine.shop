import { relations } from "drizzle-orm";
import {
	decimal,
	integer,
	jsonb,
	PgArray,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { categories } from "./category";
import { productsImages } from "./products-images";
import { productsVariations } from "./products-variations";
import { stores } from "./stores";

export const products = pgTable("products", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: varchar("name", { length: 120 }).notNull(),
	description: text("description"),
	categoryId: uuid("category_id")
		.references(() => categories.id)
		.notNull(),
	storeId: uuid("store_id")
		.references(() => stores.id)
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export const productsRelations = relations(products, ({ one, many }) => ({
	store: one(stores, {
		fields: [products.storeId],
		references: [stores.id],
	}),
	images: many(productsImages),
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id],
	}),
	variations: many(productsVariations),
}));
