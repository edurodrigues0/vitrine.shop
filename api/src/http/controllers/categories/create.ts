import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { CategoryAlreadyExistsError } from "~/use-cases/@errors/categories/category-already-exists-error";
import { makeCreateCategoryUseCase } from "~/use-cases/@factories/categories/make-create-category-use-case";

const createCategoryBodySchema = z.object({
	name: z
		.string()
		.min(1, "Nome é obrigatório")
		.max(100, "Nome deve ter no máximo 100 caracteres"),
	slug: z
		.string()
		.min(1, "Slug é obrigatório")
		.max(100, "Slug deve ter no máximo 100 caracteres")
		.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			"Slug deve conter apenas letras minúsculas, números e hífens",
		),
});

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Cria uma nova categoria
 *     tags: [Categories]
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
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: Eletrônicos
 *               slug:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$'
 *                 example: eletronicos
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
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
 *       409:
 *         description: Categoria já existe
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
export async function createCategoryController(
	request: Request,
	response: Response,
) {
	try {
		const body = createCategoryBodySchema.parse(request.body);

		const createCategoryUseCase = makeCreateCategoryUseCase();

		const { category } = await createCategoryUseCase.execute({
			name: body.name,
			slug: body.slug,
		});

		return response.status(201).json({
			category,
		});
	} catch (error) {
		console.error("Error creating category:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof CategoryAlreadyExistsError) {
			return response.status(409).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
