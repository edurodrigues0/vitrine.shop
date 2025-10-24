import { relations } from "drizzle-orm";
import {
	boolean,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { cities } from "./cities";
import { products } from "./products";
import { subscriptions } from "./subscriptions";
import { users } from "./users";

export const storeStatusEnum = pgEnum("store_status", ["ACTIVE", "INACTIVE"]);

export const stores = pgTable("stores", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: varchar("name", { length: 120 }).notNull(),
	description: text("description"),
	logoUrl: text("logo_url"),
	whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
	cityId: uuid("city_id")
		.references(() => cities.id)
		.notNull(),
	ownerId: uuid("owner_id").notNull(), // referência ao usuário dono
	status: storeStatusEnum("status").default("INACTIVE").notNull(),
	isPaid: boolean("is_paid").default(false).notNull(), // controle rápido de visibilidade
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const storesRelations = relations(stores, ({ one, many }) => ({
	city: one(cities, {
		fields: [stores.cityId],
		references: [cities.id],
	}),
	owner: one(users, {
		fields: [stores.ownerId],
		references: [users.id],
	}),
	products: many(products),
	subscriptions: many(subscriptions),
	users: many(users),
}));
