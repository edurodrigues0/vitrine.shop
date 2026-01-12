import type { Request, Response } from "express";
import z from "zod";
import { makeFindAttributeValueByIdUseCase } from "~/use-cases/@factories/attributes-values/make-find-attribute-value-by-id-use-case";

const findAttributeValueByIdParamsSchema = z.object({
	id: z.string().uuid("ID do valor de atributo deve ser um UUID válido"),
});

/**
 * @swagger
 * /attributes-values/{id}:
 *   get:
 *     summary: Busca um valor de atributo por ID
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
 *     responses:
 *       200:
 *         description: Valor de atributo encontrado
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
 *       404:
 *         description: Valor de atributo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
export async function findAttributeValueByIdController(
	request: Request,
	response: Response,
) {
	const { id } = findAttributeValueByIdParamsSchema.parse(request.params);

	const findAttributeValueByIdUseCase = makeFindAttributeValueByIdUseCase();

	const { attributeValue } = await findAttributeValueByIdUseCase.execute({
		id,
	});

	return response.status(200).json({
		attributeValue,
	});
}

