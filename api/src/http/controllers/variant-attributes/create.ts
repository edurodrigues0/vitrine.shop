import type { Request, Response } from "express";
import z from "zod";
import { makeCreateVariantAttributeUseCase } from "~/use-cases/@factories/variant-attributes/make-create-variant-attribute-use-case";

const createVariantAttributeBodySchema = z.object({
	productVariantId: z.string().uuid("Product Variant ID deve ser um UUID válido"),
	attributeId: z.string().uuid("Attribute ID deve ser um UUID válido"),
});

/**
 * @swagger
 * /variant-attributes:
 *   post:
 *     summary: Adiciona um atributo a uma variação de produto
 *     tags: [VariantAttributes]
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
 *               - productVariantId
 *               - attributeId
 *             properties:
 *               productVariantId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da variação de produto
 *               attributeId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do atributo
 *     responses:
 *       201:
 *         description: Atributo adicionado à variação com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 variantAttribute:
 *                   type: object
 *                   properties:
 *                     productVariantId:
 *                       type: string
 *                       format: uuid
 *                     attributeId:
 *                       type: string
 *                       format: uuid
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Variação ou atributo não encontrado
 *       409:
 *         description: Atributo já existe na variação
 *       422:
 *         description: Erro ao criar atributo de variação
 *       500:
 *         description: Erro interno do servidor
 */
export async function createVariantAttributeController(
	request: Request,
	response: Response,
) {
	const body = createVariantAttributeBodySchema.parse(request.body);

	const createVariantAttributeUseCase = makeCreateVariantAttributeUseCase();

	const { variantAttribute } = await createVariantAttributeUseCase.execute({
		productVariantId: body.productVariantId,
		attributeId: body.attributeId,
	});

	return response.status(201).json({
		variantAttribute,
	});
}

