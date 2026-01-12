import type { Request, Response } from "express";
import z from "zod";
import { makeUpdateStockQuantityUseCase } from "~/use-cases/@factories/stock/make-update-stock-quantity-use-case";

const updateStockQuantityParamsSchema = z.object({
	variantId: z.string().uuid("ID da variação de produto deve ser um UUID válido"),
});

const updateStockQuantityBodySchema = z.object({
	quantity: z.number().int("Quantidade deve ser um número inteiro").min(0, "Quantidade não pode ser negativa"),
});

/**
 * @swagger
 * /stock/variant/{variantId}/quantity:
 *   patch:
 *     summary: Atualiza a quantidade de estoque de uma variação
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da variação de produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: Nova quantidade em estoque
 *     responses:
 *       200:
 *         description: Quantidade de estoque atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stock:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     variantId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Estoque não encontrado
 *       422:
 *         description: Erro ao atualizar estoque
 *       500:
 *         description: Erro interno do servidor
 */
export async function updateStockQuantityController(
	request: Request,
	response: Response,
) {
	const { variantId } = updateStockQuantityParamsSchema.parse(request.params);
	const body = updateStockQuantityBodySchema.parse(request.body);

	const updateStockQuantityUseCase = makeUpdateStockQuantityUseCase();

	const { stock } = await updateStockQuantityUseCase.execute({
		variantId,
		quantity: body.quantity,
	});

	return response.status(200).json({
		stock,
	});
}

