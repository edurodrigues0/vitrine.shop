import { relations } from "drizzle-orm";
import {
	decimal,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { categories } from "./category";
import { productsImages } from "./products-images";
import { stores } from "./stores";

export const products = pgTable("products", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: varchar("name", { length: 120 }).notNull(),
	description: text("description"),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	categoryId: uuid("category_id")
		.references(() => categories.id)
		.notNull(),
	storeId: uuid("store_id")
		.references(() => stores.id)
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
}));
