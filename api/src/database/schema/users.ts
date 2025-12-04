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

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "OWNER", "EMPLOYEE"]);
export type UserRole = "ADMIN" | "OWNER" | "EMPLOYEE";

export const users = pgTable("users", {
	id: text("id").primaryKey(), // Better Auth usa text como ID
	name: varchar("name", { length: 120 }), // Opcional para Better Auth, pode ser atualizado depois
	email: varchar("email", { length: 150 }).notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	role: userRoleEnum("role").default("EMPLOYEE").notNull(),
	storeId: uuid("store_id"), // Referência removida para evitar dependência circular
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Relações são definidas nos arquivos relacionados para evitar dependências circulares
export const usersRelations = relations(users, () => ({}));
