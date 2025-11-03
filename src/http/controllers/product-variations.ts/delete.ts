import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { ProductVariationNotFoundError } from "~/use-cases/@errors/product-variations/product-variation-not-found-error";
import { makeDeleteProductVariationUseCase } from "~/use-cases/@factories/product-variations/make-delete-product-variation-use-case";

const deleteProductVariationParamsSchema = z.object({
	id: z.uuid("Valid product variation ID is required"),
});

/**
 * @swagger
 * /product-variations/{id}:
 *   delete:
 *     summary: Exclui uma variação de produto
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
 *       204:
 *         description: Variação excluída com sucesso
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
export async function deleteProductVariationController(
	request: Request,
	response: Response,
) {
	const { id } = deleteProductVariationParamsSchema.parse(request.params);

	try {
		const deleteProductVariationUseCase = makeDeleteProductVariationUseCase();

		await deleteProductVariationUseCase.execute({ id });

		return response.status(204).send();
	} catch (error) {
		console.error("Error deleting product variation:", error);

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
