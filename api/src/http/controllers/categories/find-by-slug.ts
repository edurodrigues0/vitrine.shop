import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { CategoryNotFoundError } from "~/use-cases/@errors/categories/category-not-found-error";
import { makeFindCategoryBySlugUseCase } from "~/use-cases/@factories/categories/make-find-category-by-slug-use-case";

const findCategoryBySlugParamsSchema = z.object({
	slug: z.string().min(1, "Slug é obrigatório"),
});

/**
 * @swagger
 * /categories/slug/{slug}:
 *   get:
 *     summary: Busca uma categoria pelo slug
 *     tags: [Categories]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug da categoria
 *         example: eletronicos
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
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
export async function findCategoryBySlugController(
	request: Request,
	response: Response,
) {
	try {
		const { slug } = findCategoryBySlugParamsSchema.parse(request.params);

		const findCategoryBySlugUseCase = makeFindCategoryBySlugUseCase();

		const { category } = await findCategoryBySlugUseCase.execute({ slug });

		return response.status(200).json({
			category,
		});
	} catch (error) {
		console.error("Error finding category by slug:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof CategoryNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
