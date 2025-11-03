import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { ProductVariationNotFoundError } from "~/use-cases/@errors/product-variations/product-variation-not-found-error";
import { makeFindProductVariationByIdUseCase } from "~/use-cases/@factories/product-variations/make-find-product-variation-by-id-use-case";

const findProductVariationByIdParamsSchema = z.object({
	id: z.uuid("Valid product variation ID is required"),
});

/**
 * @swagger
 * /product-variations/{id}:
 *   get:
 *     summary: Busca uma variação de produto por ID
 *     tags: [Product Variations]
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
 *         description: ID da variação do produto
 *     responses:
 *       200:
 *         description: Variação de produto encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productVariation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     size:
 *                       type: string
 *                     color:
 *                       type: string
 *                     weight:
 *                       type: string
 *                       nullable: true
 *                     dimensions:
 *                       type: object
 *                       nullable: true
 *                     discountPrice:
 *                       type: integer
 *                       nullable: true
 *                     price:
 *                       type: integer
 *                     stock:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Variação de produto não encontrada
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
export async function findProductVariationByIdController(
	request: Request,
	response: Response,
) {
	const { id } = findProductVariationByIdParamsSchema.parse(request.params);

	try {
		const findProductVariationByIdUseCase =
			makeFindProductVariationByIdUseCase();

		const { productVariation } = await findProductVariationByIdUseCase.execute({
			id,
		});

		return response.status(200).json({
			productVariation,
		});
	} catch (error) {
		console.error("Error finding product variation by id:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof ProductVariationNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
