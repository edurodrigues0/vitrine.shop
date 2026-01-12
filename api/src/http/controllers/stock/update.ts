import type { Request, Response } from "express";
import z from "zod";
import { makeUpdateStockUseCase } from "~/use-cases/@factories/stock/make-update-stock-use-case";

const updateStockParamsSchema = z.object({
	id: z.string().uuid("ID do estoque deve ser um UUID válido"),
})

const updateStockBodySchema = z.object({
	quantity: z.number().int("Quantidade deve ser um número inteiro").min(0, "Quantidade não pode ser negativa").optional(),
});

/**
 * @swagger
 * /stock/{id}:
 *   put:
 *     summary: Atualiza um estoque
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: Nova quantidade em estoque
 *     responses:
 *       200:
 *         description: Estoque atualizado com sucesso
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
export async function updateStockController(
	request: Request,
	response: Response,
) {
	const { id } = updateStockParamsSchema.parse(request.params);
	const body = updateStockBodySchema.parse(request.body);

	const updateStockUseCase = makeUpdateStockUseCase();

	const { stock } = await updateStockUseCase.execute({
		id,
		data: {
			quantity: body.quantity,
		},
	});

	return response.status(200).json({
		stock,
	});
}

