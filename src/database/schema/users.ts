import { relations } from "drizzle-orm";
import {
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { stores } from "./stores";

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "OWNER", "EMPLOYEE"]);
export type UserRole = (typeof userRoleEnum.enumValues)[number];

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: varchar("name", { length: 120 }).notNull(),
	email: varchar("email", { length: 150 }).notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	role: userRoleEnum("role").default("EMPLOYEE").notNull(),
	storeId: uuid("store_id").references(() => stores.id),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const usersRelations = relations(users, ({ one }) => ({
	store: one(stores, {
		fields: [users.storeId],
		references: [stores.id],
	}),
}));
