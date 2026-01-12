import type { Request, Response } from "express";
import z from "zod";
import { makeFindAttributeByIdUseCase } from "~/use-cases/@factories/attributes/make-find-attribute-by-id-use-case";

const findAttributeByIdParamsSchema = z.object({
	id: z.string().uuid("ID do atributo deve ser um UUID válido"),
});

/**
 * @swagger
 * /attributes/{id}:
 *   get:
 *     summary: Busca um atributo por ID
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
 *     responses:
 *       200:
 *         description: Atributo encontrado
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
 *       404:
 *         description: Atributo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
export async function findAttributeByIdController(
	request: Request,
	response: Response,
) {
	const { id } = findAttributeByIdParamsSchema.parse(request.params);

	const findAttributeByIdUseCase = makeFindAttributeByIdUseCase();

	const { attribute } = await findAttributeByIdUseCase.execute({ id });

	return response.status(200).json({
		attribute,
	});
}

