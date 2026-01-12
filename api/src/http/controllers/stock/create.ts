import type { Request, Response } from "express";
import z from "zod";
import { makeCreateStockUseCase } from "~/use-cases/@factories/stock/make-create-stock-use-case";

const createStockBodySchema = z.object({
	variantId: z.string().uuid("Variant ID deve ser um UUID válido"),
	quantity: z.number().int("Quantidade deve ser um número inteiro").min(0, "Quantidade não pode ser negativa"),
});

/**
 * @swagger
 * /stock:
 *   post:
 *     summary: Cria um novo estoque para uma variação de produto
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - variantId
 *               - quantity
 *             properties:
 *               variantId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da variação de produto
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 description: Quantidade em estoque
 *     responses:
 *       201:
 *         description: Estoque criado com sucesso
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
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Variação de produto não encontrada
 *       422:
 *         description: Erro ao criar estoque
 *       500:
 *         description: Erro interno do servidor
 */
export async function createStockController(
	request: Request,
	response: Response,
) {
	const body = createStockBodySchema.parse(request.body);

	const createStockUseCase = makeCreateStockUseCase();

	const { stock } = await createStockUseCase.execute({
		variantId: body.variantId,
		quantity: body.quantity,
	});

	return response.status(201).json({
		stock,
	});
}

