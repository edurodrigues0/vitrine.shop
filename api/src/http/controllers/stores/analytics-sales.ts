import type { Response } from "express";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { DrizzleORM } from "~/database/connection";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { orders } from "~/database/schema";
import { StoreNotFoundError } from "~/use-cases/@errors/stores/store-not-found-error";
import { makeFindStoreByIdUseCase } from "~/use-cases/@factories/stores/make-find-store-by-id-use-case";

/**
 * @swagger
 * /stores/{id}/analytics/sales:
 *   get:
 *     summary: Busca analytics de vendas para gráficos
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
 *         description: Data inicial (ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (ISO 8601)
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *         description: Agrupar por dia, semana ou mês
 *     responses:
 *       200:
 *         description: Analytics de vendas
 */
export async function getStoreSalesAnalyticsController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { id } = request.params;
		const { startDate, endDate, groupBy = "day" } = request.query;

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

		// Construir query base
		let dateFormat: string;
		let dateTrunc: string;

		switch (groupBy) {
			case "week":
				dateFormat = "YYYY-\"W\"WW";
				dateTrunc = "week";
				break;
			case "month":
				dateFormat = "YYYY-MM";
				dateTrunc = "month";
				break;
			default: // day
				dateFormat = "YYYY-MM-DD";
				dateTrunc = "day";
				break;
		}

		// Buscar vendas agrupadas por período
		const salesData = await DrizzleORM
			.select({
				date: sql<string>`to_char(${orders.createdAt}, ${sql.raw(`'${dateFormat}'`)})`,
				total: sql<number>`coalesce(sum(${orders.total}), 0)`,
				count: sql<number>`count(*)`,
			})
			.from(orders)
			.where(
				and(
					eq(orders.storeId, id),
					gte(orders.createdAt, start),
					lte(orders.createdAt, end),
				),
			)
			.groupBy(sql`to_char(${orders.createdAt}, ${sql.raw(`'${dateFormat}'`)})`)
			.orderBy(sql`to_char(${orders.createdAt}, ${sql.raw(`'${dateFormat}'`)})`);

		// Calcular ticket médio por período
		const salesWithAverage = salesData.map((item) => ({
			date: item.date,
			revenue: Number(item.total),
			orders: Number(item.count),
			averageTicket: Number(item.count) > 0
				? Number(item.total) / Number(item.count)
				: 0,
		}));

		return response.status(200).json({
			sales: salesWithAverage,
			period: {
				start: start.toISOString(),
				end: end.toISOString(),
				groupBy,
			},
		});
	} catch (error) {
		console.error("Error getting sales analytics:", error);

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

