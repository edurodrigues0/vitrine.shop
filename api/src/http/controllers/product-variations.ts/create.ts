import type { Request, Response } from "express";
import z, { ZodError } from "zod";
import { FailedToCreateProductVariationError } from "~/use-cases/@errors/product-variations/failed-to-create-product-variation-error";
import { ProductNotFoundError } from "~/use-cases/@errors/products/product-not-found-error";
import { makeCreateProductVariationUseCase } from "~/use-cases/@factories/product-variations/make-create-product-variation-use-case";

const createProductVariationsBodySchema = z.object({
	productId: z.uuid("Valid product ID is required"),
	size: z.string("Valid size is required"),
	color: z.string("Valid color is required"),
	weight: z.string().optional(),
	dimensions: z.record(z.any(), z.any()).optional(),
	discountPrice: z.number().optional(),
	price: z.number("Valid price is required"),
	stock: z.number("Valid stock is required"),
});

/**
 * @swagger
 * /product-variations:
 *   post:
 *     summary: Cria uma nova variação de produto
 *     tags: [Product Variations]
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
 *               - productId
 *               - size
 *               - color
 *               - price
 *               - stock
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 description: ID do produto
 *               size:
 *                 type: string
 *                 description: Tamanho da variação
 *                 example: "M"
 *               color:
 *                 type: string
 *                 description: Cor da variação
 *                 example: "Azul"
 *               weight:
 *                 type: string
 *                 description: Peso da variação (opcional)
 *                 example: "0.5"
 *               dimensions:
 *                 type: object
 *                 description: Dimensões da variação (opcional)
 *               discountPrice:
 *                 type: number
 *                 description: Preço com desconto (opcional)
 *                 example: 89.99
 *               price:
 *                 type: number
 *                 description: Preço da variação
 *                 example: 99.99
 *               stock:
 *                 type: number
 *                 description: Estoque disponível
 *                 example: 50
 *     responses:
 *       201:
 *         description: Variação de produto criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productVariation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     size:
 *                       type: string
 *                     color:
 *                       type: string
 *                     weight:
 *                       type: string
 *                       nullable: true
 *                     dimensions:
 *                       type: object
 *                       nullable: true
 *                     discountPrice:
 *                       type: integer
 *                       nullable: true
 *                     price:
 *                       type: integer
 *                     stock:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Produto não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function createProductVariationsController(
	request: Request,
	response: Response,
) {
	const body = createProductVariationsBodySchema.parse(request.body);

	try {
		const createProductVariationsUseCase = makeCreateProductVariationUseCase();

		const { productVariation } = await createProductVariationsUseCase.execute({
			productId: body.productId,
			size: body.size,
			color: body.color,
			weight: body.weight ?? null,
			dimensions: body.dimensions ?? null,
			discountPrice: body.discountPrice ?? null,
			price: body.price,
			stock: body.stock,
		});

		return response.status(201).json({
			productVariation,
		});
	} catch (error) {
		console.error("Error creating product variation:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof ProductNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		if (error instanceof FailedToCreateProductVariationError) {
			return response.status(500).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
