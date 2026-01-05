import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { ProductLimitExceededError } from "~/use-cases/@errors/plans/product-limit-exceeded-error";
import { SubscriptionRequiredError } from "~/use-cases/@errors/plans/subscription-required-error";
import { makeCreateProductUseCase } from "~/use-cases/@factories/products/make-create-product-use-case";

const createProductBodySchema = z.object({
	name: z
		.string()
		.min(1, "Nome é obrigatório")
		.max(120, "Nome deve ter no máximo 120 caracteres"),
	description: z.string().optional(),
	price: z
		.number()
		.int("Preço deve ser um número inteiro (em centavos)")
		.min(0, "Preço não pode ser negativo")
		.optional(),
	quantity: z
		.number()
		.int("Quantidade deve ser um número inteiro")
		.min(0, "Quantidade não pode ser negativa")
		.optional(),
	color: z
		.string()
		.max(50, "Cor deve ter no máximo 50 caracteres")
		.optional(),
	categoryId: z.uuid("ID da categoria deve ser um UUID válido"),
	storeId: z.uuid("ID da loja deve ser um UUID válido"),
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Cria um novo produto
 *     tags: [Products]
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
 *               - name
 *               - price
 *               - colors
 *               - categoryId
 *               - storeId
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 120
 *                 description: Nome do produto
 *                 example: "Camiseta Polo"
 *               description:
 *                 type: string
 *                 description: Descrição do produto
 *                 example: "Camiseta polo de alta qualidade"
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *                 maximum: 999999.99
 *                 description: Preço do produto
 *                 example: 99.99
 *               discountPrice:
 *                 type: number
 *                 minimum: 0.01
 *                 maximum: 999999.99
 *                 description: Preço com desconto (opcional)
 *                 example: 79.99
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 default: 0
 *                 description: Quantidade em estoque
 *                 example: 50
 *               colors:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                 description: Lista de cores disponíveis
 *                 example: ["Azul", "Preto", "Branco"]
 *               size:
 *                 type: string
 *                 maxLength: 100
 *                 description: Tamanho do produto (opcional)
 *                 example: "M"
 *               weight:
 *                 type: number
 *                 minimum: 0.01
 *                 maximum: 999.99
 *                 description: Peso do produto em kg (opcional)
 *                 example: 0.5
 *               dimensions:
 *                 type: object
 *                 description: Dimensões do produto (opcional)
 *                 example: {"length": 30, "width": 25, "height": 5}
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da categoria
 *               storeId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da loja
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     categoryId:
 *                       type: string
 *                       format: uuid
 *                     storeId:
 *                       type: string
 *                       format: uuid
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Erro de validação
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
export async function createProductController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const body = createProductBodySchema.parse(request.body);

		const createProductUseCase = makeCreateProductUseCase();

		const { product } = await createProductUseCase.execute({
			categoryId: body.categoryId,
			description: body.description,
			name: body.name,
			storeId: body.storeId,
			price: body.price,
			quantity: body.quantity,
			color: body.color,
		});

		return response.status(201).json({
			product: {
				id: product.id,
				name: product.name,
				description: product.description,
				categoryId: product.categoryId,
				storeId: product.storeId,
				createdAt: product.createdAt,
			},
		});
	} catch (error) {
		console.error("Error creating product:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof ProductLimitExceededError) {
			return response.status(403).json({
				message: error.message,
				code: "PRODUCT_LIMIT_EXCEEDED",
				current: error.current,
				limit: error.limit,
				planId: error.planId,
			});
		}

		if (error instanceof SubscriptionRequiredError) {
			return response.status(403).json({
				message: error.message,
				code: "SUBSCRIPTION_REQUIRED",
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}
