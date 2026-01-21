import type { Request, Response } from "express";
import z from "zod";
import { makeFindVariantAttributesByVariantIdUseCase } from "~/use-cases/@factories/variant-attributes/make-find-variant-attributes-by-variant-id-use-case";

const findVariantAttributesByVariantIdParamsSchema = z.object({
	variantId: z.string().uuid("ID da variação de produto deve ser um UUID válido"),
});

/**
 * @swagger
 * /variant-attributes/variant/{variantId}:
 *   get:
 *     summary: Busca atributos de uma variação de produto
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
 *     responses:
 *       200:
 *         description: Lista de atributos da variação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 variantAttributes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productVariantId:
 *                         type: string
 *                         format: uuid
 *                       attributeId:
 *                         type: string
 *                         format: uuid
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Variação não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
export async function findVariantAttributesByVariantIdController(
	request: Request,
	response: Response,
) {
	const { variantId } = findVariantAttributesByVariantIdParamsSchema.parse(request.params);

	const findVariantAttributesByVariantIdUseCase =
		makeFindVariantAttributesByVariantIdUseCase();

	const { variantAttributes } =
		await findVariantAttributesByVariantIdUseCase.execute({
			variantId,
		});

	return response.status(200).json({
		variantAttributes,
	});
}

