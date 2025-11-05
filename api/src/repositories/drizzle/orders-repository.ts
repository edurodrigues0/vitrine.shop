import { and, count, desc, eq, ilike } from "drizzle-orm";
import type { DrizzleORM } from "~/database/connection";
import { type Order, type OrderItem, orderItems, orders } from "~/database/schema";
import type {
	CreateOrderParams,
	FindAllOrdersParams,
	OrdersRepository,
	OrderItemsRepository,
	UpdateOrderStatusParams,
} from "../orders-repository";

export class DrizzleOrdersRepository implements OrdersRepository {
	constructor(private readonly drizzle: typeof DrizzleORM) {}

	async create({
		storeId,
		customerName,
		customerPhone,
		customerEmail,
		total,
		notes,
	}: CreateOrderParams): Promise<Order> {
		const [order] = await this.drizzle
			.insert(orders)
			.values({
				storeId,
				customerName,
				customerPhone,
				customerEmail,
				total,
				notes,
				status: "PENDENTE",
			})
			.returning();

		if (!order) {
			throw new Error("Failed to create order");
		}

		return order;
	}

	async findById({ id }: { id: string }): Promise<Order | null> {
		const [order] = await this.drizzle
			.select()
			.from(orders)
			.where(eq(orders.id, id));

		return order ?? null;
	}

	async findAll({
		page,
		limit,
		filters,
	}: FindAllOrdersParams): Promise<{
		orders: Order[];
		pagination: {
			totalItems: number;
			totalPages: number;
			currentPage: number;
			perPage: number;
		};
	}> {
		const offset = (page - 1) * limit;

		const conditions = [];

		if (filters.storeId) {
			conditions.push(eq(orders.storeId, filters.storeId));
		}

		if (filters.status) {
			conditions.push(eq(orders.status, filters.status as any));
		}

		if (filters.customerName) {
			conditions.push(ilike(orders.customerName, `%${filters.customerName}%`));
		}

		if (filters.customerPhone) {
			conditions.push(ilike(orders.customerPhone, `%${filters.customerPhone}%`));
		}

		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const ordersResult = await this.drizzle
			.select()
			.from(orders)
			.where(whereClause)
			.orderBy(desc(orders.createdAt))
			.limit(limit)
			.offset(offset);

		const [totalResult] = await this.drizzle
			.select({ count: count() })
			.from(orders)
			.where(whereClause);

		const totalItems = totalResult?.count ?? 0;
		const totalPages = Math.ceil(totalItems / limit);

		return {
			orders: ordersResult,
			pagination: {
				totalItems,
				totalPages,
				currentPage: page,
				perPage: limit,
			},
		};
	}

	async findByStoreId({ storeId }: { storeId: string }): Promise<Order[]> {
		const ordersResult = await this.drizzle
			.select()
			.from(orders)
			.where(eq(orders.storeId, storeId))
			.orderBy(desc(orders.createdAt));

		return ordersResult;
	}

	async updateStatus({
		id,
		status,
	}: UpdateOrderStatusParams): Promise<Order | null> {
		const [updatedOrder] = await this.drizzle
			.update(orders)
			.set({
				status,
				updatedAt: new Date(),
			})
			.where(eq(orders.id, id))
			.returning();

		return updatedOrder ?? null;
	}
}

export class DrizzleOrderItemsRepository implements OrderItemsRepository {
	constructor(private readonly drizzle: typeof DrizzleORM) {}

	async createMany(
		items: Array<{
			orderId: string;
			productVariationId: string;
			quantity: number;
			price: number;
		}>,
	): Promise<OrderItem[]> {
		const insertedItems = await this.drizzle
			.insert(orderItems)
			.values(items)
			.returning();

		return insertedItems;
	}

	async findByOrderId({ orderId }: { orderId: string }): Promise<OrderItem[]> {
		const items = await this.drizzle
			.select()
			.from(orderItems)
			.where(eq(orderItems.orderId, orderId));

		return items;
	}
}

