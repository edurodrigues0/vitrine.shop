import type { Request, Response } from "express";
import z from "zod";
import { makeCreateAttributeValueUseCase } from "~/use-cases/@factories/attributes-values/make-create-attribute-value-use-case";

const createAttributeValueBodySchema = z.object({
	attributeId: z.string().uuid("Attribute ID deve ser um UUID válido"),
	value: z.string().min(1, "Valor é obrigatório").max(100, "Valor deve ter no máximo 100 caracteres"),
});

/**
 * @swagger
 * /attributes-values:
 *   post:
 *     summary: Cria um novo valor de atributo
 *     tags: [AttributesValues]
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
 *               - attributeId
 *               - value
 *             properties:
 *               attributeId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do atributo
 *               value:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Valor do atributo
 *                 example: "Vermelho"
 *     responses:
 *       201:
 *         description: Valor de atributo criado com sucesso
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
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Atributo não encontrado
 *       409:
 *         description: Valor de atributo já existe
 *       422:
 *         description: Erro ao criar valor de atributo
 *       500:
 *         description: Erro interno do servidor
 */
export async function createAttributeValueController(
	request: Request,
	response: Response,
) {
	const body = createAttributeValueBodySchema.parse(request.body);

	const createAttributeValueUseCase = makeCreateAttributeValueUseCase();

	const { attributeValue } = await createAttributeValueUseCase.execute({
		attributeId: body.attributeId,
		value: body.value,
	});

	return response.status(201).json({
		attributeValue,
	});
}

