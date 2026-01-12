import { pgTable, primaryKey, timestamp, uuid } from "drizzle-orm/pg-core";
import { attributes } from "./attributes";
import { productsVariations } from "./products-variations";
import { relations } from "drizzle-orm";

export const variantAttributes = pgTable("variant_attributes", {
	productVariantId: uuid("product_variant_id")
		.references(() => productsVariations.id)
		.notNull(),
	attributeId: uuid("attribute_id")
		.references(() => attributes.id)
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, 
(t) => ({
	pk: primaryKey({ columns: [t.attributeId, t.productVariantId] }),
}));

export type VariantAttribute = typeof variantAttributes.$inferSelect;
export type NewVariantAttribute = typeof variantAttributes.$inferInsert;

export const variantAttributesRelations = relations(variantAttributes, ({ one }) => ({
  variant: one(productsVariations, {
    fields: [variantAttributes.productVariantId],
    references: [productsVariations.id],
  }),
  attribute: one(attributes, {
    fields: [variantAttributes.attributeId],
    references: [attributes.id],
  }),
}));