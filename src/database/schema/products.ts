import { relations } from "drizzle-orm";
import {
	decimal,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { stores } from "./store";

export const products = pgTable("products", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: varchar("name", { length: 120 }).notNull(),
	description: text("description"),
	price: decimal("price", { precision: 10, scale: 2 }).notNull(),
	category: varchar("category", { length: 50 }).notNull(), // ex: joia, acessório, roupa
	imageUrl: text("image_url").notNull(),
	storeId: uuid("store_id")
		.references(() => stores.id)
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productsRelations = relations(products, ({ one }) => ({
	store: one(stores, {
		fields: [products.storeId],
		references: [stores.id],
	}),
}));
