import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { InsufficientStockError } from "~/use-cases/@errors/orders/insufficient-stock-error";
import { makeCreateOrderUseCase } from "~/use-cases/@factories/orders/make-create-order-use-case";

const createOrderBodySchema = z.object({
	storeId: z.string().uuid("ID da loja deve ser um UUID válido"),
	customerName: z.string().min(1, "Nome do cliente é obrigatório").max(120),
	customerPhone: z.string().min(1, "Telefone do cliente é obrigatório").max(20),
	customerEmail: z.string().email("E-mail inválido").optional(),
	items: z
		.array(
			z.object({
				productVariationId: z.string().uuid("ID da variação deve ser um UUID válido"),
				quantity: z.number().int("Quantidade deve ser um número inteiro").min(1),
			}),
		)
		.min(1, "Pelo menos um item deve ser fornecido"),
	notes: z.string().optional(),
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Cria um novo pedido
 *     tags: [Orders]
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
 *               - storeId
 *               - customerName
 *               - customerPhone
 *               - items
 *             properties:
 *               storeId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da loja
 *               customerName:
 *                 type: string
 *                 description: Nome do cliente
 *               customerPhone:
 *                 type: string
 *                 description: Telefone do cliente
 *               customerEmail:
 *                 type: string
 *                 format: email
 *                 description: E-mail do cliente (opcional)
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productVariationId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *               notes:
 *                 type: string
 *                 description: Observações do pedido
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Erro de validação ou estoque insuficiente
 *       401:
 *         description: Não autenticado
 */
export async function createOrderController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const body = createOrderBodySchema.parse(request.body);

		const createOrderUseCase = makeCreateOrderUseCase();

		const { order, items } = await createOrderUseCase.execute({
			storeId: body.storeId,
			customerName: body.customerName,
			customerPhone: body.customerPhone,
			customerEmail: body.customerEmail,
			items: body.items,
			notes: body.notes,
		});

		return response.status(201).json({
			order,
			items,
		});
	} catch (error) {
		console.error("Error creating order:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof InsufficientStockError) {
			return response.status(400).json({
				message: error.message,
			});
		}

		return response.status(500).json({
			message: "Internal server error",
		});
	}
}

