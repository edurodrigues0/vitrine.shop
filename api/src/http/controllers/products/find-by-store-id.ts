import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { makeFindProductsByStoreIdUseCase } from "~/use-cases/@factories/products/make-find-products-by-store-id-use-case";

const findProductsByStoreIdParamsSchema = z.object({
	storeId: z.string().uuid("ID da loja deve ser um UUID válido"),
});

/**
 * @swagger
 * /products/store/{storeId}:
 *   get:
 *     summary: Lista todos os produtos de uma loja
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da loja
 *     responses:
 *       200:
 *         description: Lista de produtos da loja retornada com sucesso
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
 *                       categoryId:
 *                         type: string
 *                         format: uuid
 *                       storeId:
 *                         type: string
 *                         format: uuid
 *                       createdAt:
 *                         type: string
 *                         format: date-time
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
export async function findProductsByStoreIdController(
	request: Request,
	response: Response,
) {
	try {
		const { storeId } = findProductsByStoreIdParamsSchema.parse(request.params);

		const findProductsByStoreIdUseCase = makeFindProductsByStoreIdUseCase();

		const { products } = await findProductsByStoreIdUseCase.execute({
			storeId,
		});

		return response.status(200).json({
			products: products.map((product) => ({
				id: product.id,
				name: product.name,
				description: product.description,
				categoryId: product.categoryId,
				storeId: product.storeId,
				createdAt: product.createdAt,
			})),
		});
	} catch (error) {
		console.error("Error finding products by store ID:", error);

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
