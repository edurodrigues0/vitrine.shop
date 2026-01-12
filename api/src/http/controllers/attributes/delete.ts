import type { Request, Response } from "express";
import z from "zod";
import { makeDeleteAttributeUseCase } from "~/use-cases/@factories/attributes/make-delete-attribute-use-case";

const deleteAttributeParamsSchema = z.object({
	id: z.string().uuid("ID do atributo deve ser um UUID válido"),
});

/**
 * @swagger
 * /attributes/{id}:
 *   delete:
 *     summary: Deleta um atributo
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
 *       204:
 *         description: Atributo deletado com sucesso
 *       404:
 *         description: Atributo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
export async function deleteAttributeController(
	request: Request,
	response: Response,
) {
	const { id } = deleteAttributeParamsSchema.parse(request.params);

	const deleteAttributeUseCase = makeDeleteAttributeUseCase();

	await deleteAttributeUseCase.execute({ id });

	return response.status(204).send();
}

