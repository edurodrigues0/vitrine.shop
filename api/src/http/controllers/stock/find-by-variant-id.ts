import type { Request, Response } from "express";
import z from "zod";
import { makeFindStockByVariantIdUseCase } from "~/use-cases/@factories/stock/make-find-stock-by-variant-id-use-case";

const findStockByVariantIdParamsSchema = z.object({
	variantId: z.string().uuid("ID da variação de produto deve ser um UUID válido"),
});

/**
 * @swagger
 * /stock/variant/{variantId}:
 *   get:
 *     summary: Busca estoque por ID da variação
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
 *     responses:
 *       200:
 *         description: Estoque encontrado
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
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Variação ou estoque não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
export async function findStockByVariantIdController(
	request: Request,
	response: Response,
	) {
		const { variantId } = findStockByVariantIdParamsSchema.parse(request.params);

	const findStockByVariantIdUseCase = makeFindStockByVariantIdUseCase();

	const { stock } = await findStockByVariantIdUseCase.execute({
		variantId,
	});

	return response.status(200).json({
		stock,
	});
}

