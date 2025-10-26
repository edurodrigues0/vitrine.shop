import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { products } from "./products";

export const productsImages = pgTable("products_images", {
	id: uuid("id").defaultRandom().primaryKey(),
	productId: uuid("product_id")
		.references(() => products.id)
		.notNull(),
	url: text("url").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProductImage = typeof productsImages.$inferSelect;
export type NewProductImage = typeof productsImages.$inferInsert;

export const productsImagesRelations = relations(productsImages, ({ one }) => ({
	product: one(products, {
		fields: [productsImages.productId],
		references: [products.id],
	}),
}));
