import { integer, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { productsVariations } from "./products-variations";
import { relations } from "drizzle-orm";

export const stocks = pgTable("stocks", {
  id: uuid("id").defaultRandom().primaryKey(),
  variantId: uuid("variant_id")
    .references(() => productsVariations.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  quantity: integer("quantity").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export type Stock = typeof stocks.$inferSelect;
export type NewStock = typeof stocks.$inferInsert;

export const stocksRelations = relations(stocks, ({ one }) => ({
  variant: one(productsVariations, {
    fields: [stocks.variantId],
    references: [productsVariations.id],
  }),
}));