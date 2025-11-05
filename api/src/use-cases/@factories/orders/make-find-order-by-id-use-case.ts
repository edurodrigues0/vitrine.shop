import { DrizzleORM } from "~/database/connection";
import { DrizzleOrdersRepository } from "~/repositories/drizzle/orders-repository";
import { FindOrderByIdUseCase } from "~/use-cases/orders/find-order-by-id";

export function makeFindOrderByIdUseCase() {
	const ordersRepository = new DrizzleOrdersRepository(DrizzleORM);
	return new FindOrderByIdUseCase(ordersRepository);
}

