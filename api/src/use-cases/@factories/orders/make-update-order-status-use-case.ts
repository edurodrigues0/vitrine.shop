import { DrizzleORM } from "~/database/connection";
import { DrizzleOrdersRepository } from "~/repositories/drizzle/orders-repository";
import { UpdateOrderStatusUseCase } from "~/use-cases/orders/update-order-status";

export function makeUpdateOrderStatusUseCase() {
	const ordersRepository = new DrizzleOrdersRepository(DrizzleORM);
	return new UpdateOrderStatusUseCase(ordersRepository);
}

