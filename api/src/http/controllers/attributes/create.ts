import type { Request, Response } from "express";
import z from "zod";
import { makeCreateAttributeUseCase } from "~/use-cases/@factories/attributes/make-create-attribute-use-case";

const createAttributeBodySchema = z.object({
	name: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
});

/**
 * @swagger
 * /attributes:
 *   post:
 *     summary: Cria um novo atributo
 *     tags: [Attributes]
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
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Nome do atributo
 *                 example: "Cor"
 *     responses:
 *       201:
 *         description: Atributo criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attribute:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erro de validação ou atributo já existe
 *       409:
 *         description: Atributo já existe
 *       422:
 *         description: Erro ao criar atributo
 *       500:
 *         description: Erro interno do servidor
 */
export async function createAttributeController(
	request: Request,
	response: Response,
) {
	const body = createAttributeBodySchema.parse(request.body);

	const createAttributeUseCase = makeCreateAttributeUseCase();

	const { attribute } = await createAttributeUseCase.execute({
		name: body.name,
	});

	return response.status(201).json({
		attribute,
	});
}

