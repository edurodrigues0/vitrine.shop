import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { makeFindProductImagesByProductVariationIdUseCase } from "~/use-cases/@factories/product-images/make-find-product-images-by-product-variation-id-use-case";

const findProductImagesByProductVariationIdParamsSchema = z.object({
	productVariationId: z.uuid("Valid product variation ID is required"),
});

/**
 * @swagger
 * /product-images/variation/{productVariationId}:
 *   get:
 *     summary: Lista todas as imagens de uma variação de produto
 *     tags: [Product Images]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: productVariationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da variação do produto
 *     responses:
 *       200:
 *         description: Lista de imagens retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productImages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       productVariationId:
 *                         type: string
 *                         format: uuid
 *                       url:
 *                         type: string
 *                         format: uri
 *                       isMain:
 *                         type: boolean
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
export async function findProductImagesByProductVariationIdController(
	request: Request,
	response: Response,
) {
	try {
		const { productVariationId } =
			findProductImagesByProductVariationIdParamsSchema.parse(request.params);

		const findProductImagesByProductVariationIdUseCase =
			makeFindProductImagesByProductVariationIdUseCase();

		const { productImages } =
			await findProductImagesByProductVariationIdUseCase.execute({
				productVariationId,
			});

		return response.status(200).json({
			productImages,
		});
	} catch (error) {
		console.error(
			"Error finding product images by product variation id:",
			error,
		);

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
