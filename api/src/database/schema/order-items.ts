import { relations } from "drizzle-orm";
import { integer, pgTable, uuid } from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { productsVariations } from "./products-variations";

export const orderItems = pgTable("order_items", {
	id: uuid("id").defaultRandom().primaryKey(),
	orderId: uuid("order_id")
		.references(() => orders.id, { onDelete: "cascade" })
		.notNull(),
	productVariationId: uuid("product_variation_id")
		.references(() => productsVariations.id)
		.notNull(),
	quantity: integer("quantity").notNull(),
	price: integer("price").notNull(), // Preço unitário em centavos no momento da compra
});

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id],
	}),
	productVariation: one(productsVariations, {
		fields: [orderItems.productVariationId],
		references: [productsVariations.id],
	}),
}));

