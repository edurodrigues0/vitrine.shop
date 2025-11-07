import { DrizzleORM } from "~/database/connection";
import { DrizzleOrdersRepository, DrizzleOrderItemsRepository } from "~/repositories/drizzle/orders-repository";
import { DrizzleProductVariationsRepository } from "~/repositories/drizzle/product-variations";
import { UpdateOrderStatusUseCase } from "~/use-cases/orders/update-order-status";

export function makeUpdateOrderStatusUseCase() {
	const ordersRepository = new DrizzleOrdersRepository(DrizzleORM);
	const orderItemsRepository = new DrizzleOrderItemsRepository(DrizzleORM);
	const productVariationsRepository = new DrizzleProductVariationsRepository(DrizzleORM);
	return new UpdateOrderStatusUseCase(
		ordersRepository,
		orderItemsRepository,
		productVariationsRepository,
	);
}

