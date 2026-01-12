import type { Request, Response } from "express";
import z from "zod";
import { makeUpdateAttributeUseCase } from "~/use-cases/@factories/attributes/make-update-attribute-use-case";

const updateAttributeParamsSchema = z.object({
	id: z.string().uuid("ID do atributo deve ser um UUID válido"),
});

const updateAttributeBodySchema = z.object({
	name: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres").optional(),
});

/**
 * @swagger
 * /attributes/{id}:
 *   put:
 *     summary: Atualiza um atributo
 *     tags: [Attributes]
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
 *         description: ID do atributo
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
 *                 description: Novo nome do atributo
 *     responses:
 *       200:
 *         description: Atributo atualizado com sucesso
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
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Atributo não encontrado
 *       422:
 *         description: Erro ao atualizar atributo
 *       500:
 *         description: Erro interno do servidor
 */
export async function updateAttributeController(
	request: Request,
	response: Response,
) {
	const { id } = updateAttributeParamsSchema.parse(request.params);
	const body = updateAttributeBodySchema.parse(request.body);

	const updateAttributeUseCase = makeUpdateAttributeUseCase();

	const { attribute } = await updateAttributeUseCase.execute({
		id,
		data: {
			name: body.name,
		},
	});

	return response.status(200).json({
		attribute,
	});
}

