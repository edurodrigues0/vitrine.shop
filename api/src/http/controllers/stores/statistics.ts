import type { Response } from "express";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { DrizzleORM } from "~/database/connection";
import { eq, and, gte, sql } from "drizzle-orm";
import { orders, stores } from "~/database/schema";
import { StoreNotFoundError } from "~/use-cases/@errors/stores/store-not-found-error";
import { makeFindStoreByIdUseCase } from "~/use-cases/@factories/stores/make-find-store-by-id-use-case";

/**
 * @swagger
 * /stores/{id}/statistics:
 *   get:
 *     summary: Busca estatísticas de uma loja
 *     tags: [Stores]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Estatísticas da loja
 *       404:
 *         description: Loja não encontrada
 */
export async function getStoreStatisticsController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { id } = request.params;

		if (!id) {
			return response.status(400).json({
				message: "ID da loja é obrigatório",
			});
		}

		// Verificar se a loja existe
		const findStoreByIdUseCase = makeFindStoreByIdUseCase();
		const { store } = await findStoreByIdUseCase.execute({ id });

		// Verificar se o usuário é o dono da loja
		if (request.user && request.user.id !== store.ownerId) {
			return response.status(403).json({
				message: "Você não tem permissão para acessar essas estatísticas",
			});
		}

		// Calcular estatísticas
		const now = new Date();
		const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		// Total de pedidos
		const [totalOrdersResult] = await DrizzleORM
			.select({ count: sql<number>`count(*)` })
			.from(orders)
			.where(eq(orders.storeId, id));

		const totalOrders = Number(totalOrdersResult?.count || 0);

		// Pedidos dos últimos 7 dias
		const [ordersLast7DaysResult] = await DrizzleORM
			.select({ count: sql<number>`count(*)` })
			.from(orders)
			.where(
				and(
					eq(orders.storeId, id),
					gte(orders.createdAt, sevenDaysAgo),
				),
			);

		const ordersLast7Days = Number(ordersLast7DaysResult?.count || 0);

		// Pedidos dos últimos 30 dias
		const [ordersLast30DaysResult] = await DrizzleORM
			.select({ count: sql<number>`count(*)` })
			.from(orders)
			.where(
				and(
					eq(orders.storeId, id),
					gte(orders.createdAt, thirtyDaysAgo),
				),
			);

		const ordersLast30Days = Number(ordersLast30DaysResult?.count || 0);

		// Receita total
		const [totalRevenueResult] = await DrizzleORM
			.select({ total: sql<number>`coalesce(sum(${orders.total}), 0)` })
			.from(orders)
			.where(eq(orders.storeId, id));

		const totalRevenue = Number(totalRevenueResult?.total || 0);

		// Receita dos últimos 7 dias
		const [revenueLast7DaysResult] = await DrizzleORM
			.select({ total: sql<number>`coalesce(sum(${orders.total}), 0)` })
			.from(orders)
			.where(
				and(
					eq(orders.storeId, id),
					gte(orders.createdAt, sevenDaysAgo),
				),
			);

		const revenueLast7Days = Number(revenueLast7DaysResult?.total || 0);

		// Receita dos últimos 30 dias
		const [revenueLast30DaysResult] = await DrizzleORM
			.select({ total: sql<number>`coalesce(sum(${orders.total}), 0)` })
			.from(orders)
			.where(
				and(
					eq(orders.storeId, id),
					gte(orders.createdAt, thirtyDaysAgo),
				),
			);

		const revenueLast30Days = Number(revenueLast30DaysResult?.total || 0);

		// Pedidos por status
		const ordersByStatus = await DrizzleORM
			.select({
				status: orders.status,
				count: sql<number>`count(*)`,
			})
			.from(orders)
			.where(eq(orders.storeId, id))
			.groupBy(orders.status);

		const statusCounts = ordersByStatus.reduce(
			(acc, item) => {
				acc[item.status] = Number(item.count);
				return acc;
			},
			{} as Record<string, number>,
		);

		return response.status(200).json({
			statistics: {
				totalOrders,
				ordersLast7Days,
				ordersLast30Days,
				totalRevenue,
				revenueLast7Days,
				revenueLast30Days,
				ordersByStatus: {
					PENDENTE: statusCounts.PENDENTE || 0,
					CONFIRMADO: statusCounts.CONFIRMADO || 0,
					PREPARANDO: statusCounts.PREPARANDO || 0,
					ENVIADO: statusCounts.ENVIADO || 0,
					ENTREGUE: statusCounts.ENTREGUE || 0,
					CANCELADO: statusCounts.CANCELADO || 0,
				},
			},
		});
	} catch (error) {
		console.error("Error getting store statistics:", error);

		if (error instanceof StoreNotFoundError) {
			return response.status(404).json({
				message: "Loja não encontrada",
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

