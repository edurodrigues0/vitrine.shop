import type { Request, Response } from "express";
import { ProductNotFoundError } from "~/use-cases/@errors/products/product-not-found-error";
import { makeFindProductByIdUseCase } from "~/use-cases/@factories/products/make-find-product-by-id-use-case";

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Busca um produto por ID
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
 *         description: Produto encontrado
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
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: ID do produto é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Produto não encontrado
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
export async function findProductByIdController(
	request: Request,
	response: Response,
) {
	try {
		const { id } = request.params;

		if (!id) {
			return response.status(400).json({
				message: "ID do produto é obrigatório",
			});
		}

		const findProductByIdUseCase = makeFindProductByIdUseCase();

		const { product } = await findProductByIdUseCase.execute({ id });

		if (!product) {
			return response.status(404).json({
				message: "Produto não encontrado",
			});
		}

		return response.status(200).json({
			product: {
				id: product.id,
				name: product.name,
				description: product.description,
				categoryId: product.categoryId,
				storeId: product.storeId,
				price: product.price,
				quantity: product.quantity,
				color: product.color,
				createdAt: product.createdAt,
			},
		});
	} catch (error) {
		console.error("Error finding product by ID:", error);

		if (error instanceof ProductNotFoundError) {
			return response.status(404).json({
				message: "Produto não encontrado",
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
