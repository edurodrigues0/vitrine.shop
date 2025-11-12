import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { ProductImageNotFoundError } from "~/use-cases/@errors/product-images/product-image-not-found-error";
import { makeDeleteProductImageUseCase } from "~/use-cases/@factories/product-images/make-delete-product-image-use-case";

const deleteProductImageParamsSchema = z.object({
	id: z.uuid("Valid product image ID is required"),
});

/**
 * @swagger
 * /product-images/{id}:
 *   delete:
 *     summary: Exclui uma imagem de produto
 *     tags: [Product Images]
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
 *         description: ID da imagem do produto
 *     responses:
 *       204:
 *         description: Imagem excluída com sucesso
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Imagem não encontrada
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
export async function deleteProductImageController(
	request: Request,
	response: Response,
) {
	try {
		const { id } = deleteProductImageParamsSchema.parse(request.params);

		// O use case já cuida da deleção do arquivo físico do storage
		// Não precisamos duplicar essa lógica aqui
		const deleteProductImageUseCase = makeDeleteProductImageUseCase();
		await deleteProductImageUseCase.execute({ id });

		return response.status(204).send();
	} catch (error) {
		console.error("Error deleting product image:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof ProductImageNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
