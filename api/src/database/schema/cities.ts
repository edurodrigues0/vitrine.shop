import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const cities = pgTable("cities", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: varchar("name", { length: 100 }).notNull(),
	slug: varchar("slug", { length: 120 }).notNull().unique(),
	state: varchar("state", { length: 2 }).notNull(), // ex: MG, SP
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type City = typeof cities.$inferSelect;
export type NewCity = typeof cities.$inferInsert;
