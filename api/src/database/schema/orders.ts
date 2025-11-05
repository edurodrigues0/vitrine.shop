import { relations } from "drizzle-orm";
import {
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { orderItems } from "./order-items";
import { stores } from "./stores";

export const orderStatusEnum = pgEnum("order_status", [
	"PENDENTE",
	"CONFIRMADO",
	"PREPARANDO",
	"ENVIADO",
	"ENTREGUE",
	"CANCELADO",
]);

export const orders = pgTable("orders", {
	id: uuid("id").defaultRandom().primaryKey(),
	storeId: uuid("store_id")
		.references(() => stores.id)
		.notNull(),
	customerName: varchar("customer_name", { length: 120 }).notNull(),
	customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
	customerEmail: varchar("customer_email", { length: 150 }),
	total: integer("total").notNull(), // Total em centavos
	status: orderStatusEnum("status").default("PENDENTE").notNull(),
	notes: text("notes"), // Observações do pedido
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export const ordersRelations = relations(orders, ({ one, many }) => ({
	store: one(stores, {
		fields: [orders.storeId],
		references: [stores.id],
	}),
	items: many(orderItems),
}));

