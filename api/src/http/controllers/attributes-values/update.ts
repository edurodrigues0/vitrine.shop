import type { Request, Response } from "express";
import z from "zod";
import { makeUpdateAttributeValueUseCase } from "~/use-cases/@factories/attributes-values/make-update-attribute-value-use-case";

const updateAttributeValueParamsSchema = z.object({
	id: z.string().uuid("ID do valor de atributo deve ser um UUID válido"),
})

const updateAttributeValueBodySchema = z.object({
	value: z.string().min(1, "Valor é obrigatório").max(100, "Valor deve ter no máximo 100 caracteres").optional(),
});

/**
 * @swagger
 * /attributes-values/{id}:
 *   put:
 *     summary: Atualiza um valor de atributo
 *     tags: [AttributesValues]
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
 *         description: ID do valor de atributo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Novo valor do atributo
 *     responses:
 *       200:
 *         description: Valor de atributo atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attributeValue:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     attributeId:
 *                       type: string
 *                       format: uuid
 *                     value:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Valor de atributo não encontrado
 *       422:
 *         description: Erro ao atualizar valor de atributo
 *       500:
 *         description: Erro interno do servidor
 */
export async function updateAttributeValueController(
	request: Request,
	response: Response,
) {
	const { id } = updateAttributeValueParamsSchema.parse(request.params);
	const body = updateAttributeValueBodySchema.parse(request.body);

	const updateAttributeValueUseCase = makeUpdateAttributeValueUseCase();

	const { attributeValue } = await updateAttributeValueUseCase.execute({
		id,
		data: {
			value: body.value,
		},
	});

	return response.status(200).json({
		attributeValue,
	});
}

