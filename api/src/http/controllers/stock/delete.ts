import type { Request, Response } from "express";
import z from "zod";
import { makeDeleteStockUseCase } from "~/use-cases/@factories/stock/make-delete-stock-use-case";

const deleteStockParamsSchema = z.object({
	id: z.string().uuid("ID do estoque deve ser um UUID válido"),
});

/**
 * @swagger
 * /stock/{id}:
 *   delete:
 *     summary: Deleta um estoque
 *     tags: [Stock]
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
 *         description: ID do estoque
 *     responses:
 *       204:
 *         description: Estoque deletado com sucesso
 *       404:
 *         description: Estoque não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
export async function deleteStockController(
	request: Request,
	response: Response,
) {
	const { id } = deleteStockParamsSchema.parse(request.params);

	const deleteStockUseCase = makeDeleteStockUseCase();

	await deleteStockUseCase.execute({ id });

	return response.status(204).send();
}

