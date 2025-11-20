import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { makeFindAllStoresUseCase } from "~/use-cases/@factories/stores/make-find-all-stores-use-case";

const findAllStoresQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	name: z.string().optional(),
	description: z.string().optional(),
	slug: z.string().optional(),
	ownerId: z.string().uuid().optional(),
	cityId: z.string().uuid().optional(),
	isPaid: z.coerce.boolean().optional(),
});

/**
 * @swagger
 * /stores:
 *   get:
 *     summary: Lista todas as lojas com paginação e filtros
 *     tags: [Stores]
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
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrar por nome
 *         required: false
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Filtrar por descrição
 *         required: false
 *       - in: query
 *         name: slug
 *         schema:
 *           type: string
 *         description: Filtrar por slug
 *         required: false
 *       - in: query
 *         name: ownerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID do proprietário
 *         required: false
 *       - in: query
 *         name: isPaid
 *         schema:
 *           type: boolean
 *         description: Filtrar por status de pagamento
 *         required: false
 *     responses:
 *       200:
 *         description: Lista de lojas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       slug:
 *                         type: string
 *                       theme:
 *                         type: object
 *                       status:
 *                         type: string
 *                         enum: [ACTIVE, INACTIVE]
 *                       logoUrl:
 *                         type: string
 *                         nullable: true
 *                       whatsapp:
 *                         type: string
 *                       instagramUrl:
 *                         type: string
 *                         nullable: true
 *                       facebookUrl:
 *                         type: string
 *                         nullable: true
 *                       bannerUrl:
 *                         type: string
 *                         nullable: true
 *                       cityId:
 *                         type: string
 *                         format: uuid
 *                       ownerId:
 *                         type: string
 *                       isPaid:
 *                         type: boolean
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
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function findAllStoresController(
	request: Request,
	response: Response,
) {
	try {
		const { page, limit, name, description, slug, ownerId, cityId, isPaid } =
			findAllStoresQuerySchema.parse(request.query);

		const findAllStoresUseCase = makeFindAllStoresUseCase();

		const { stores, pagination } = await findAllStoresUseCase.execute({
			page,
			limit,
			filters: {
				name,
				description,
				slug,
				ownerId,
				cityName,
				isPaid,
			},
		});

		return response.status(200).json({
			stores: stores.map((store) => ({
				id: store.id,
				name: store.name,
				description: store.description,
				slug: store.slug,
				theme: store.theme,
				status: store.status,
				logoUrl: store.logoUrl,
				whatsapp: store.whatsapp,
				instagramUrl: store.instagramUrl,
				facebookUrl: store.facebookUrl,
				bannerUrl: store.bannerUrl,
				cityId: store.cityId,
				ownerId: store.ownerId,
				isPaid: store.isPaid,
				createdAt: store.createdAt,
				updatedAt: store.updatedAt,
			})),
			meta: {
				totalItems: pagination.totalItems,
				totalPages: pagination.totalPages,
				currentPage: pagination.currentPage,
				perPage: pagination.perPage,
			},
		});
	} catch (error) {
		console.error("Error finding all stores:", error);

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
