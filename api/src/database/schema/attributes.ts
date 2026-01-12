import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { attributesValues } from "./attributes-values";
import { relations } from "drizzle-orm";

export const attributes = pgTable("attributes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // ex: Tamanho, Cor, Peso, etc...
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export type Attribute = typeof attributes.$inferSelect;
export type NewAttribute = typeof attributes.$inferInsert;

export const attributesRelations = relations(attributes, ({ many }) => ({
  values: many(attributesValues),
}));