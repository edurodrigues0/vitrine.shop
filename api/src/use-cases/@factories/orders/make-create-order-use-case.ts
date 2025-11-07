import { DrizzleORM } from "~/database/connection";
import { DrizzleOrderItemsRepository, DrizzleOrdersRepository } from "~/repositories/drizzle/orders-repository";
import { DrizzleProductVariationsRepository } from "~/repositories/drizzle/product-variations";
import { DrizzleStoresRepository } from "~/repositories/drizzle/stores-repository";
import { DrizzleNotificationsRepository } from "~/repositories/drizzle/notifications-repository";
import { CreateOrderUseCase } from "~/use-cases/orders/create-order";

export function makeCreateOrderUseCase() {
	const ordersRepository = new DrizzleOrdersRepository(DrizzleORM);
	const orderItemsRepository = new DrizzleOrderItemsRepository(DrizzleORM);
	const productVariationsRepository = new DrizzleProductVariationsRepository(DrizzleORM);
	const storesRepository = new DrizzleStoresRepository(DrizzleORM);
	const notificationsRepository = new DrizzleNotificationsRepository(DrizzleORM);

	return new CreateOrderUseCase(
		ordersRepository,
		orderItemsRepository,
		productVariationsRepository,
		storesRepository,
		notificationsRepository,
	);
}

