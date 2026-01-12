import type { Request, Response } from "express";
import z from "zod";
import { makeDeleteAttributeValueUseCase } from "~/use-cases/@factories/attributes-values/make-delete-attribute-value-use-case";

const deleteAttributeValueParamsSchema = z.object({
	id: z.string().uuid("ID do valor de atributo deve ser um UUID válido"),
});

/**
 * @swagger
 * /attributes-values/{id}:
 *   delete:
 *     summary: Deleta um valor de atributo
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
 *       204:
 *         description: Valor de atributo deletado com sucesso
 *       404:
 *         description: Valor de atributo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
export async function deleteAttributeValueController(
	request: Request,
	response: Response,
) {
	const { id } = deleteAttributeValueParamsSchema.parse(request.params);

	const deleteAttributeValueUseCase = makeDeleteAttributeValueUseCase();

	await deleteAttributeValueUseCase.execute({ id });

	return response.status(204).send();
}

