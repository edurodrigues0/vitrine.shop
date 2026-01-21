import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { attributes } from "./attributes";
import { relations } from "drizzle-orm";

export const attributesValues = pgTable("attributes_values", {
  id: uuid("id").defaultRandom().primaryKey(),
  attributeId: uuid("attribute_id")
  .references(() => attributes.id, { onDelete: "cascade" })
  .notNull(),
  value: varchar("value", { length: 100 }).notNull(), // ex: P, M, G, Vermelho, Azul, etc...
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AttributeValue = typeof attributesValues.$inferSelect;
export type NewAttributeValue = typeof attributesValues.$inferInsert;

export const attributesValuesRelations = relations(attributesValues, ({ one }) => ({
  attribute: one(attributes, {
    fields: [attributesValues.attributeId],
    references: [attributes.id],
  }),
}));