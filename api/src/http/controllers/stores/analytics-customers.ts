import type { Response } from "express";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { DrizzleORM } from "~/database/connection";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { orders } from "~/database/schema";
import { StoreNotFoundError } from "~/use-cases/@errors/stores/store-not-found-error";
import { makeFindStoreByIdUseCase } from "~/use-cases/@factories/stores/make-find-store-by-id-use-case";

/**
 * @swagger
 * /stores/{id}/analytics/customers:
 *   get:
 *     summary: Busca analytics de clientes
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
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Analytics de clientes
 */
export async function getStoreCustomersAnalyticsController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { id } = request.params;
		const { startDate, endDate } = request.query;

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

		// Definir período padrão (últimos 30 dias se não especificado)
		const now = new Date();
		const defaultStartDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
		const start = startDate ? new Date(startDate as string) : defaultStartDate;
		const end = endDate ? new Date(endDate as string) : now;

		// Clientes mais frequentes
		const topCustomers = await DrizzleORM
			.select({
				customerName: orders.customerName,
				customerPhone: orders.customerPhone,
				orderCount: sql<number>`count(*)`,
				totalSpent: sql<number>`coalesce(sum(${orders.total}), 0)`,
				averageTicket: sql<number>`coalesce(avg(${orders.total}), 0)`,
			})
			.from(orders)
			.where(
				and(
					eq(orders.storeId, id),
					gte(orders.createdAt, start),
					lte(orders.createdAt, end),
				),
			)
			.groupBy(orders.customerName, orders.customerPhone)
			.orderBy(desc(sql`count(*)`))
			.limit(10);

		// Total de clientes únicos
		const [uniqueCustomersResult] = await DrizzleORM
			.select({
				count: sql<number>`count(distinct ${orders.customerPhone})`,
			})
			.from(orders)
			.where(
				and(
					eq(orders.storeId, id),
					gte(orders.createdAt, start),
					lte(orders.createdAt, end),
				),
			);

		const uniqueCustomers = Number(uniqueCustomersResult?.count || 0);

		// Clientes recorrentes (mais de 1 pedido) - usar subquery
		const recurringCustomersQuery = await DrizzleORM
			.select({
				customerPhone: orders.customerPhone,
				orderCount: sql<number>`count(*)`,
			})
			.from(orders)
			.where(
				and(
					eq(orders.storeId, id),
					gte(orders.createdAt, start),
					lte(orders.createdAt, end),
				),
			)
			.groupBy(orders.customerPhone)
			.having(sql`count(*) > 1`);

		const recurringCustomers = recurringCustomersQuery.length;

		// Ticket médio geral
		const [averageTicketResult] = await DrizzleORM
			.select({
				average: sql<number>`coalesce(avg(${orders.total}), 0)`,
			})
			.from(orders)
			.where(
				and(
					eq(orders.storeId, id),
					gte(orders.createdAt, start),
					lte(orders.createdAt, end),
				),
			);

		const averageTicket = Number(averageTicketResult?.average || 0);

		return response.status(200).json({
			topCustomers: topCustomers.map((item) => ({
				customerName: item.customerName,
				customerPhone: item.customerPhone,
				orderCount: Number(item.orderCount),
				totalSpent: Number(item.totalSpent),
				averageTicket: Number(item.averageTicket),
			})),
			uniqueCustomers,
			recurringCustomers,
			averageTicket,
			period: {
				start: start.toISOString(),
				end: end.toISOString(),
			},
		});
	} catch (error) {
		console.error("Error getting customers analytics:", error);

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

