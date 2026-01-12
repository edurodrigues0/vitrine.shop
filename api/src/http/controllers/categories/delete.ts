import type { Request, Response } from "express";
import z from "zod";
import { makeDeleteCategoryUseCase } from "~/use-cases/@factories/categories/make-delete-category-use-case";

const deleteCategoryParamsSchema = z.object({
	id: z.uuid("Valid category ID is required"),
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Deleta uma categoria
 *     tags: [Categories]
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
 *         description: ID da categoria
 *     responses:
 *       204:
 *         description: Categoria deletada com sucesso
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Categoria não encontrada
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
export async function deleteCategoryController(
	request: Request,
	response: Response,
) {
	const { id } = deleteCategoryParamsSchema.parse(request.params);

	const deleteCategoryUseCase = makeDeleteCategoryUseCase();

	await deleteCategoryUseCase.execute({ id });

	return response.status(204).send();
}
