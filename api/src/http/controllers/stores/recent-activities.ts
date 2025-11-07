import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { DrizzleORM } from "~/database/connection";
import { orders, products, storeVisits } from "~/database/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { makeFindStoreByIdUseCase } from "~/use-cases/@factories/stores/make-find-store-by-id-use-case";
import { subDays } from "date-fns";

interface Activity {
	id: string;
	type: "ORDER" | "PRODUCT" | "VISIT";
	title: string;
	description: string;
	createdAt: Date;
	relatedId?: string;
}

/**
 * @swagger
 * /stores/{id}/activities:
 *   get:
 *     summary: Busca atividades recentes da loja
 *     tags: [Stores]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da loja
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Número máximo de atividades a retornar
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Número de dias para buscar atividades
 *     responses:
 *       200:
 *         description: Lista de atividades recentes
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Loja não encontrada
 */
export async function getStoreRecentActivitiesController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { id } = request.params;
		const limit = parseInt((request.query.limit as string) || "20", 10);
		const days = parseInt((request.query.days as string) || "7", 10);

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
				message: "Você não tem permissão para acessar essas atividades",
			});
		}

		const startDate = subDays(new Date(), days);

		// Buscar pedidos recentes
		const recentOrders = await DrizzleORM
			.select({
				id: orders.id,
				customerName: orders.customerName,
				total: orders.total,
				status: orders.status,
				createdAt: orders.createdAt,
			})
			.from(orders)
			.where(
				and(
					eq(orders.storeId, id),
					gte(orders.createdAt, startDate),
				),
			)
			.orderBy(desc(orders.createdAt))
			.limit(limit);

		// Buscar produtos criados recentemente
		const recentProducts = await DrizzleORM
			.select({
				id: products.id,
				name: products.name,
				createdAt: products.createdAt,
			})
			.from(products)
			.where(
				and(
					eq(products.storeId, id),
					gte(products.createdAt, startDate),
				),
			)
			.orderBy(desc(products.createdAt))
			.limit(limit);

		// Buscar visitas recentes
		const recentVisits = await DrizzleORM
			.select({
				id: storeVisits.id,
				visitedAt: storeVisits.visitedAt,
			})
			.from(storeVisits)
			.where(
				and(
					eq(storeVisits.storeId, id),
					gte(storeVisits.visitedAt, startDate),
				),
			)
			.orderBy(desc(storeVisits.visitedAt))
			.limit(limit);

		// Combinar e ordenar todas as atividades
		const activities: Activity[] = [
			...recentOrders.map((order) => ({
				id: order.id,
				type: "ORDER" as const,
				title: "Novo pedido recebido",
				description: `Pedido de ${order.customerName} no valor de R$ ${(order.total / 100).toFixed(2).replace(".", ",")}`,
				createdAt: order.createdAt,
				relatedId: order.id,
			})),
			...recentProducts.map((product) => ({
				id: product.id,
				type: "PRODUCT" as const,
				title: "Produto criado",
				description: `Produto "${product.name}" foi adicionado à loja`,
				createdAt: product.createdAt,
				relatedId: product.id,
			})),
			...recentVisits.map((visit) => ({
				id: visit.id,
				type: "VISIT" as const,
				title: "Nova visita",
				description: "Alguém visitou sua loja",
				createdAt: visit.visitedAt,
				relatedId: visit.id,
			})),
		];

		// Ordenar por data (mais recente primeiro)
		activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

		// Limitar ao número solicitado
		const limitedActivities = activities.slice(0, limit);

		return response.status(200).json({
			activities: limitedActivities.map((activity) => ({
				...activity,
				createdAt: activity.createdAt.toISOString(),
			})),
		});
	} catch (error) {
		console.error("Error fetching recent activities:", error);
		return response.status(500).json({
			message: "Erro ao buscar atividades recentes",
		});
	}
}

