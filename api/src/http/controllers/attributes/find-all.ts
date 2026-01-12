import type { Request, Response } from "express";
import z from "zod";
import { makeFindAllAttributesUseCase } from "~/use-cases/@factories/attributes/make-find-all-attributes-use-case";

const findAllAttributesQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(10),
	name: z.string().optional(),
});

/**
 * @swagger
 * /attributes:
 *   get:
 *     summary: Lista todos os atributos
 *     tags: [Attributes]
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
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtro por nome (opcional)
 *     responses:
 *       200:
 *         description: Lista de atributos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attributes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
 */
export async function findAllAttributesController(
	request: Request,
	response: Response,
) {
	const query = findAllAttributesQuerySchema.parse(request.query);

	const findAllAttributesUseCase = makeFindAllAttributesUseCase();

	const { attributes, pagination } = await findAllAttributesUseCase.execute({
		page: query.page,
		limit: query.limit,
		filters: {
			name: query.name,
		},
	});

	return response.status(200).json({
		attributes,
		pagination,
	});
}

