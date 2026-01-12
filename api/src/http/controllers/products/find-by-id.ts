import type { Request, Response } from "express";
import z from "zod";
import { makeFindProductDetailsByIdUseCase } from "~/use-cases/@factories/products/make-find-product-details-by-id-use-case";

const findProductByIdParamsSchema = z.object({
	id: z.string().uuid("ID do produto deve ser um UUID válido"),
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Busca um produto por ID com todas as informações relacionadas
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado com variações, imagens, atributos e estoque
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     categoryId:
 *                       type: string
 *                       format: uuid
 *                     storeId:
 *                       type: string
 *                       format: uuid
 *                     active:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 variations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       productId:
 *                         type: string
 *                         format: uuid
 *                       sku:
 *                         type: string
 *                       price:
 *                         type: integer
 *                       discountPrice:
 *                         type: integer
 *                         nullable: true
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       stock:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           variantId:
 *                             type: string
 *                             format: uuid
 *                           quantity:
 *                             type: integer
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                       images:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                             productVariationId:
 *                               type: string
 *                               format: uuid
 *                             url:
 *                               type: string
 *                             isMain:
 *                               type: boolean
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                       attributes:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             attribute:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   format: uuid
 *                                 name:
 *                                   type: string
 *                                 createdAt:
 *                                   type: string
 *                                   format: date-time
 *                                 updatedAt:
 *                                   type: string
 *                                   format: date-time
 *                             values:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                     format: uuid
 *                                   attributeId:
 *                                     type: string
 *                                     format: uuid
 *                                   value:
 *                                     type: string
 *                                   createdAt:
 *                                     type: string
 *                                     format: date-time
 *                                   updatedAt:
 *                                     type: string
 *                                     format: date-time
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Produto não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
export async function findProductByIdController(
	request: Request,
	response: Response,
) {
	const { id } = findProductByIdParamsSchema.parse(request.params);

	const findProductDetailsByIdUseCase = makeFindProductDetailsByIdUseCase();

	const { product, variations } = await findProductDetailsByIdUseCase.execute({
		id,
	});

	return response.status(200).json({
		product,
		variations,
	});
}
