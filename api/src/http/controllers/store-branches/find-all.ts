import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { makeFindAllStoreBranchesUseCase } from "~/use-cases/@factories/store-branches/make-find-all-store-branches-use-case";
import { makeFindAllStoresUseCase } from "~/use-cases/@factories/stores/make-find-all-stores-use-case";

const findAllStoreBranchesQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	cityId: z.string().uuid().optional(),
	name: z.string().optional(),
	isMain: z.coerce.boolean().optional(),
});

/**
 * @swagger
 * /store-branches:
 *   get:
 *     summary: Lista todas as filiais das lojas do usuário autenticado
 *     tags: [Store Branches]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Quantidade de itens por página
 *       - in: query
 *         name: cityId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID da cidade
 *         required: false
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrar por nome da filial
 *         required: false
 *       - in: query
 *         name: isMain
 *         schema:
 *           type: boolean
 *         description: Filtrar por filial principal
 *         required: false
 *     responses:
 *       200:
 *         description: Lista de filiais retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 branches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       parentStoreId:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       cityId:
 *                         type: string
 *                         format: uuid
 *                       isMain:
 *                         type: boolean
 *                       whatsapp:
 *                         type: string
 *                         nullable: true
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     perPage:
 *                       type: integer
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function findAllStoreBranchesController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const userId = request.user?.id;

		if (!userId) {
			return response.status(401).json({
				message: "Unauthorized",
			});
		}

		const { page, limit, cityId, name, isMain } =
			findAllStoreBranchesQuerySchema.parse(request.query);

		// Buscar todas as stores do usuário
		const findAllStoresUseCase = makeFindAllStoresUseCase();
		const { stores } = await findAllStoresUseCase.execute({
			page: 1,
			limit: 1000, // Buscar todas as stores do usuário
			filters: {
				ownerId: userId,
			},
		});

		// Se o usuário não tem stores, retornar lista vazia
		if (stores.length === 0) {
			return response.status(200).json({
				branches: [],
				meta: {
					totalItems: 0,
					totalPages: 0,
					currentPage: page,
					perPage: limit,
				},
			});
		}

		// Buscar branches de todas as stores do usuário
		const storeIds = stores.map((store) => store.id);
		const findAllStoreBranchesUseCase = makeFindAllStoreBranchesUseCase();

		// Buscar branches de cada store e combinar resultados
		const allBranchesPromises = storeIds.map((storeId) =>
			findAllStoreBranchesUseCase.execute({
				page: 1,
				limit: 1000,
				filters: {
					parentStoreId: storeId,
					cityId,
					name,
					isMain,
				},
			}),
		);

		const allBranchesResults = await Promise.all(allBranchesPromises);
		let allBranches = allBranchesResults.flatMap((result) => result.branches);

		// Aplicar paginação manualmente
		const totalItems = allBranches.length;
		const totalPages = Math.ceil(totalItems / limit);
		const offset = (page - 1) * limit;
		const paginatedBranches = allBranches.slice(offset, offset + limit);

		return response.status(200).json({
			branches: paginatedBranches,
			meta: {
				totalItems,
				totalPages,
				currentPage: page,
				perPage: limit,
			},
		});
	} catch (error) {
		console.error("Error finding all store branches:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

