import { DrizzleORM } from "~/database/connection";
import { DrizzleOrdersRepository } from "~/repositories/drizzle/orders-repository";
import { FindOrdersByStoreUseCase } from "~/use-cases/orders/find-orders-by-store";

export function makeFindOrdersByStoreUseCase() {
	const ordersRepository = new DrizzleOrdersRepository(DrizzleORM);
	return new FindOrdersByStoreUseCase(ordersRepository);
}

