import type { Response } from "express";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { DrizzleORM } from "~/database/connection";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { orders, orderItems, productsVariations, products } from "~/database/schema";
import { StoreNotFoundError } from "~/use-cases/@errors/stores/store-not-found-error";
import { makeFindStoreByIdUseCase } from "~/use-cases/@factories/stores/make-find-store-by-id-use-case";

/**
 * @swagger
 * /stores/{id}/analytics/products:
 *   get:
 *     summary: Busca analytics de produtos
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de produtos a retornar
 *     responses:
 *       200:
 *         description: Analytics de produtos
 */
export async function getStoreProductsAnalyticsController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { id } = request.params;
		const { startDate, endDate, limit = "10" } = request.query;

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

		// Produtos mais vendidos
		const topProducts = await DrizzleORM
			.select({
				productId: products.id,
				productName: products.name,
				quantity: sql<number>`coalesce(sum(${orderItems.quantity}), 0)`,
				revenue: sql<number>`coalesce(sum(${orderItems.price} * ${orderItems.quantity}), 0)`,
			})
			.from(orderItems)
			.innerJoin(orders, eq(orderItems.orderId, orders.id))
			.innerJoin(productsVariations, eq(orderItems.productVariationId, productsVariations.id))
			.innerJoin(products, eq(productsVariations.productId, products.id))
			.where(
				and(
					eq(orders.storeId, id),
					gte(orders.createdAt, start),
					lte(orders.createdAt, end),
				),
			)
			.groupBy(products.id, products.name)
			.orderBy(desc(sql`coalesce(sum(${orderItems.quantity}), 0)`))
			.limit(parseInt(limit as string, 10));

		// Produtos sem estoque
		const outOfStockProducts = await DrizzleORM
			.select({
				id: products.id,
				name: products.name,
				stock: sql<number>`coalesce(sum(${productsVariations.stock}), 0)`,
			})
			.from(products)
			.leftJoin(productsVariations, eq(products.id, productsVariations.productId))
			.where(eq(products.storeId, id))
			.groupBy(products.id, products.name)
			.having(sql`coalesce(sum(${productsVariations.stock}), 0) = 0`);

		return response.status(200).json({
			topProducts: topProducts.map((item) => ({
				productId: item.productId,
				productName: item.productName,
				quantitySold: Number(item.quantity),
				revenue: Number(item.revenue),
			})),
			outOfStockProducts: outOfStockProducts.map((item) => ({
				productId: item.id,
				productName: item.name,
			})),
			period: {
				start: start.toISOString(),
				end: end.toISOString(),
			},
		});
	} catch (error) {
		console.error("Error getting products analytics:", error);

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

