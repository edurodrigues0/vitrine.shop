import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { makeFindAllProductsUseCase } from "~/use-cases/@factories/products/make-find-all-products-use-case";

const findAllProductsQuerySchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	name: z.string().optional(),
	description: z.string().optional(),
	categorySlug: z.string().optional(),
	size: z.string().optional(),
	stock: z.coerce.number().int().min(0).optional(),
	weight: z.coerce.number().positive().optional(),
});

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lista todos os produtos com paginação e filtros
 *     tags: [Products]
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
 *         description: Filtrar por nome do produto
 *         required: false
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Filtrar por descrição
 *         required: false
 *       - in: query
 *         name: categorySlug
 *         schema:
 *           type: string
 *         description: Filtrar por slug da categoria
 *         required: false
 *       - in: query
 *         name: size
 *         schema:
 *           type: string
 *         description: Filtrar por tamanho
 *         required: false
 *       - in: query
 *         name: stock
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Filtrar por estoque mínimo
 *         required: false
 *       - in: query
 *         name: weight
 *         schema:
 *           type: number
 *           minimum: 0.01
 *         description: Filtrar por peso
 *         required: false
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
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
 *                       price:
 *                         type: number
 *                       discountPrice:
 *                         type: number
 *                         nullable: true
 *                       stock:
 *                         type: integer
 *                       colors:
 *                         type: array
 *                         items:
 *                           type: string
 *                       size:
 *                         type: string
 *                         nullable: true
 *                       weight:
 *                         type: number
 *                         nullable: true
 *                       dimensions:
 *                         type: object
 *                         nullable: true
 *                       categoryId:
 *                         type: string
 *                         format: uuid
 *                       storeId:
 *                         type: string
 *                         format: uuid
 *                       createdAt:
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
export async function findAllProductsController(
	request: Request,
	response: Response,
) {
	try {
		const {
			page,
			limit,
			name,
			description,
			categorySlug,
			size,
			stock,
			weight,
		} = findAllProductsQuerySchema.parse(request.query);

		const findAllProductsUseCase = makeFindAllProductsUseCase();

		const { products, pagination } = await findAllProductsUseCase.execute({
			page,
			limit,
			filters: {
				name,
				description,
				categorySlug,
				size,
				stock,
				weight,
			},
		});

		return response.status(200).json({
			products: products.map((product) => ({
				id: product.id,
				name: product.name,
				description: product.description,
				price: product.price,
				discountPrice: product.discountPrice,
				stock: product.stock,
				colors: product.colors,
				size: product.size,
				weight: product.weight,
				dimensions: product.dimensions,
				categoryId: product.categoryId,
				storeId: product.storeId,
				createdAt: product.createdAt,
			})),
			meta: {
				totalItems: pagination.totalItems,
				totalPages: pagination.totalPages,
				currentPage: pagination.currentPage,
				perPage: pagination.perPage,
			},
		});
	} catch (error) {
		console.error("Error finding all products:", error);

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
