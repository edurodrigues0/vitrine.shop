import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { ProductNotFoundError } from "~/use-cases/@errors/products/product-not-found-error";
import { makeFindProductVariationsByProductIdUseCase } from "~/use-cases/@factories/product-variations/make-find-product-variations-by-product-id-use-case";

const findProductVariationsByProductIdParamsSchema = z.object({
	productId: z.uuid("Valid product ID is required"),
});

/**
 * @swagger
 * /product-variations/product/{productId}:
 *   get:
 *     summary: Lista todas as variações de um produto
 *     tags: [Product Variations]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Lista de variações retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productVariations:
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
 *                       size:
 *                         type: string
 *                       color:
 *                         type: string
 *                       weight:
 *                         type: string
 *                         nullable: true
 *                       dimensions:
 *                         type: object
 *                         nullable: true
 *                       discountPrice:
 *                         type: integer
 *                         nullable: true
 *                       price:
 *                         type: integer
 *                       stock:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Erro de validação
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
export async function findProductVariationsByProductIdController(
	request: Request,
	response: Response,
) {
	const { productId } = findProductVariationsByProductIdParamsSchema.parse(
		request.params,
	);

	try {
		const findProductVariationsByProductIdUseCase =
			makeFindProductVariationsByProductIdUseCase();

		const { productVariations } =
			await findProductVariationsByProductIdUseCase.execute({
				productId,
			});

		return response.status(200).json({
			productVariations,
		});
	} catch (error) {
		console.error("Error finding product variations by product id:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof ProductNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
