import { relations } from "drizzle-orm";
import { boolean, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { cities } from "./cities";
import { stores } from "./stores";

export const addresses = pgTable("addresses", {
	id: uuid("id").defaultRandom().primaryKey(),
	storeId: uuid("store_id").references(() => stores.id),
	cityId: uuid("city_id")
		.references(() => cities.id)
		.notNull(),
	street: varchar("street", { length: 255 }).notNull(),
	number: varchar("number", { length: 10 }).notNull(),
	complement: varchar("complement", { length: 255 }),
	neighborhood: varchar("neighborhood", { length: 100 }).notNull(),
	zipCode: varchar("zip_code", { length: 8 }).notNull(),
	country: varchar("country", { length: 50 }).notNull(),
	latitude: varchar("latitude", { length: 50 }),
	longitude: varchar("longitude", { length: 50 }),
	isMain: boolean("is_main").default(false).notNull(),
});

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;

export const addressesRelations = relations(addresses, ({ one }) => ({
	store: one(stores, {
		fields: [addresses.storeId],
		references: [stores.id],
	}),
	city: one(cities, {
		fields: [addresses.cityId],
		references: [cities.id],
	}),
}));
