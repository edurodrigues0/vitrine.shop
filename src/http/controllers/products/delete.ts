import type { Response } from "express";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { ProductNotFoundError } from "~/use-cases/@errors/products/product-not-found-error";
import { makeDeleteProductUseCase } from "~/use-cases/@factories/products/make-delete-product-use-case";

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Exclui um produto
 *     tags: [Products]
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
 *         description: ID do produto
 *     responses:
 *       204:
 *         description: Produto excluído com sucesso
 *       400:
 *         description: ID do produto é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Usuário não autenticado
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
export async function deleteProductController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { id } = request.params;

		if (!id) {
			return response.status(400).json({
				message: "ID do produto é obrigatório",
			});
		}

		if (!request.user) {
			return response.status(401).json({
				message: "Usuário não autenticado",
			});
		}

		const deleteProductUseCase = makeDeleteProductUseCase();

		await deleteProductUseCase.execute({ id });

		return response.status(204).send();
	} catch (error) {
		console.error("Error deleting product:", error);

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
