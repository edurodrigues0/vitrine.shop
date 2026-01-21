import type { Request, Response } from "express";
import z from "zod";
import { makeFindAttributeValuesByAttributeIdUseCase } from "~/use-cases/@factories/attributes-values/make-find-attribute-values-by-attribute-id-use-case";

const findAttributeValuesByAttributeIdParamsSchema = z.object({
	attributeId: z.string().uuid("ID do atributo deve ser um UUID válido"),
});

/**
 * @swagger
 * /attributes-values/attribute/{attributeId}:
 *   get:
 *     summary: Busca valores de atributo por ID do atributo
 *     tags: [AttributesValues]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: attributeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do atributo
 *     responses:
 *       200:
 *         description: Lista de valores do atributo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 attributeValues:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       attributeId:
 *                         type: string
 *                         format: uuid
 *                       value:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Erro interno do servidor
 */
export async function findAttributeValuesByAttributeIdController(
	request: Request,
	response: Response,
) {
	const { attributeId } = findAttributeValuesByAttributeIdParamsSchema.parse(request.params);

	const findAttributeValuesByAttributeIdUseCase =
		makeFindAttributeValuesByAttributeIdUseCase();

	const { attributeValues } =
		await findAttributeValuesByAttributeIdUseCase.execute({
			attributeId,
		});

	return response.status(200).json({
		attributeValues,
	});
}

