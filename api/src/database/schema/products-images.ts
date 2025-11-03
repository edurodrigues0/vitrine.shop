import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { products } from "./products";
import { productsVariations } from "./products-variations";

export const productsImages = pgTable("products_images", {
	id: uuid("id").defaultRandom().primaryKey(),
	isMain: boolean("is_main").default(false).notNull(),
	productVariationId: uuid("product_variation_id")
		.references(() => productsVariations.id)
		.notNull(),
	url: text("url").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProductImage = typeof productsImages.$inferSelect;
export type NewProductImage = typeof productsImages.$inferInsert;

export const productsImagesRelations = relations(productsImages, ({ one }) => ({
	productVariation: one(productsVariations, {
		fields: [productsImages.productVariationId],
		references: [productsVariations.id],
	}),
}));
