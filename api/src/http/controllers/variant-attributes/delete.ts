import type { Request, Response } from "express";
import z from "zod";
import { makeDeleteVariantAttributeUseCase } from "~/use-cases/@factories/variant-attributes/make-delete-variant-attribute-use-case";

const deleteVariantAttributeParamsSchema = z.object({
	variantId: z.string().uuid("ID da variação de produto deve ser um UUID válido"),
	attributeId: z.string().uuid("ID do atributo deve ser um UUID válido"),
});

/**
 * @swagger
 * /variant-attributes/variant/{variantId}/attribute/{attributeId}:
 *   delete:
 *     summary: Remove um atributo de uma variação de produto
 *     tags: [VariantAttributes]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: variantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da variação de produto
 *       - in: path
 *         name: attributeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do atributo
 *     responses:
 *       204:
 *         description: Atributo removido da variação com sucesso
 *       404:
 *         description: Variação ou atributo não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
export async function deleteVariantAttributeController(
	request: Request,
	response: Response,
) {
	const { variantId, attributeId } = deleteVariantAttributeParamsSchema.parse(request.params);

	const deleteVariantAttributeUseCase = makeDeleteVariantAttributeUseCase();

	await deleteVariantAttributeUseCase.execute({
		variantId,
		attributeId,
	});

	return response.status(204).send();
}

