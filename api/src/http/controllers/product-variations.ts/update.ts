import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { FailedToUpdateProductVariationError } from "~/use-cases/@errors/product-variations/failed-to-update-product-variation-error";
import { ProductVariationNotFoundError } from "~/use-cases/@errors/product-variations/product-variation-not-found-error";
import { makeUpdateProductVariationUseCase } from "~/use-cases/@factories/product-variations/make-update-product-variation-use-case";

const updateProductVariationParamsSchema = z.object({
	id: z.uuid("Valid product variation ID is required"),
});

const updateProductVariationBodySchema = z.object({
	data: z.object({
		size: z.string("Valid size is required").optional(),
		color: z.string("Valid color is required").optional(),
		weight: z.string("Valid weight is required").optional(),
		dimensions: z.record(z.any(), z.any()).optional(),
		discountPrice: z.number("Valid discount price is required").optional(),
		price: z.number("Valid price is required").optional(),
		stock: z.number("Valid stock is required").optional(),
	}),
});

/**
 * @swagger
 * /product-variations/{id}:
 *   put:
 *     summary: Atualiza uma variação de produto existente
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - data
 *             properties:
 *               data:
 *                 type: object
 *                 properties:
 *                   size:
 *                     type: string
 *                     description: Novo tamanho
 *                   color:
 *                     type: string
 *                     description: Nova cor
 *                   weight:
 *                     type: string
 *                     description: Novo peso
 *                   dimensions:
 *                     type: object
 *                     description: Novas dimensões
 *                   discountPrice:
 *                     type: number
 *                     description: Novo preço com desconto
 *                   price:
 *                     type: number
 *                     description: Novo preço
 *                   stock:
 *                     type: number
 *                     description: Novo estoque
 *     responses:
 *       200:
 *         description: Variação atualizada com sucesso
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
 *         description: Variação não encontrada
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
export async function updateProductVariationController(
	request: Request,
	response: Response,
) {
	const { id } = updateProductVariationParamsSchema.parse(request.params);
	const { data } = updateProductVariationBodySchema.parse(request.body);

	try {
		const updateProductVariationUseCase = makeUpdateProductVariationUseCase();

		const { productVariation } = await updateProductVariationUseCase.execute({
			id,
			data,
		});

		return response.status(200).json({
			productVariation,
		});
	} catch (error) {
		console.error("Error updating product variation:", error);

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

		if (error instanceof FailedToUpdateProductVariationError) {
			return response.status(500).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
