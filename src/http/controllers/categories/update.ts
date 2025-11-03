import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { CategoryNotFoundError } from "~/use-cases/@errors/categories/category-not-found-error";
import { FailedToUpdateCategoryError } from "~/use-cases/@errors/categories/failed-to-update-category-error";
import { makeUpdateCategoryUseCase } from "~/use-cases/@factories/categories/make-update-category-use-case";

const updateCategoryParamsSchema = z.object({
	id: z.uuid("Valid category ID is required"),
});

const updateCategoryBodySchema = z.object({
	name: z
		.string()
		.min(1, "Nome deve ter pelo menos 1 caractere")
		.max(100, "Nome deve ter no máximo 100 caracteres")
		.optional(),
	slug: z
		.string()
		.min(1, "Slug deve ter pelo menos 1 caractere")
		.max(100, "Slug deve ter no máximo 100 caracteres")
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			"Slug deve conter apenas letras minúsculas, números e hífens",
		)
		.optional(),
});

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Atualiza uma categoria
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Eletrônicos Atualizado
 *               slug:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$'
 *                 example: eletronicos-atualizado
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
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
export async function updateCategoryController(
	request: Request,
	response: Response,
) {
	try {
		const { id } = updateCategoryParamsSchema.parse(request.params);
		const body = updateCategoryBodySchema.parse(request.body);

		const updateData = Object.fromEntries(
			Object.entries(body).filter(([_, value]) => value !== undefined),
		);

		if (Object.keys(updateData).length === 0) {
			return response.status(400).json({
				message: "Pelo menos um campo deve ser fornecido para atualização",
			});
		}

		const updateCategoryUseCase = makeUpdateCategoryUseCase();

		const { category } = await updateCategoryUseCase.execute({
			id,
			data: updateData,
		});

		return response.status(200).json({
			category,
		});
	} catch (error) {
		console.error("Error updating category:", error);

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

		if (error instanceof FailedToUpdateCategoryError) {
			return response.status(500).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
