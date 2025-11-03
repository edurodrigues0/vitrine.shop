import { relations } from "drizzle-orm";
import {
	decimal,
	integer,
	jsonb,
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
	size: varchar("size", { length: 100 }).notNull(),
	color: varchar("color", { length: 100 }).notNull(),
	weight: decimal("weight", { precision: 10, scale: 2 }),
	dimensions: jsonb("dimensions").$type<Record<string, unknown>>(),
	discountPrice: integer("discount_price"),
	price: integer("price").notNull(),
	stock: integer("stock").notNull(),
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
