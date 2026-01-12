import { relations } from "drizzle-orm";
import {
	decimal,
	integer,
	jsonb,
	numeric,
	pgTable,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { products } from "./products";
import { productsImages } from "./products-images";

export const productsVariations = pgTable("products_variations", {
	id: uuid("id").defaultRandom().primaryKey(),
	productId: uuid("product_id")
		.references(() => products.id)
		.notNull(),
	sku: varchar("sku", { length: 100 }).notNull(),
	price: integer("price").notNull(),
	discountPrice: integer("discount_price"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ProductVariation = typeof productsVariations.$inferSelect;
export type NewProductVariation = typeof productsVariations.$inferInsert;

export const productsVariationsRelations = relations(
	productsVariations,
	({ one, many }) => ({
		product: one(products, {
			fields: [productsVariations.productId],
			references: [products.id],
		}),
		images: many(productsImages),
	}),
);
