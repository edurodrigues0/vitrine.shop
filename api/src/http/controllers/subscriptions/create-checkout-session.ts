import type { Response } from "express";
import z, { ZodError } from "zod";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { StoreNotFoundError } from "~/use-cases/@errors/stores/store-not-found-error";
import { UserNotFoundError } from "~/use-cases/@errors/users/user-not-found-error";
import { makeCreateCheckoutSessionUseCase } from "~/use-cases/@factories/subscriptions/make-create-checkout-session-use-case";

const createCheckoutSessionBodySchema = z.object({
	storeId: z.uuid("Store ID must be a valid UUID"),
	priceId: z.string().min(1, "Price ID is required"),
	successUrl: z.url("Success URL must be a valid URL"),
	cancelUrl: z.url("Cancel URL must be a valid URL"),
});

/**
 * @swagger
 * /subscriptions/checkout:
 *   post:
 *     summary: Cria uma sessão de checkout do Stripe para assinatura
 *     tags: [Subscriptions]
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
 *               - priceId
 *               - successUrl
 *               - cancelUrl
 *             properties:
 *               storeId:
 *                 type: string
 *                 format: uuid
 *                 description: ID da loja
 *               priceId:
 *                 type: string
 *                 description: ID do preço do plano no Stripe
 *               successUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL de redirecionamento após pagamento bem-sucedido
 *               cancelUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL de redirecionamento se o pagamento for cancelado
 *     responses:
 *       200:
 *         description: Sessão de checkout criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 checkoutUrl:
 *                   type: string
 *                   format: uri
 *                   description: URL da sessão de checkout do Stripe
 *       400:
 *         description: Erro de validação
 *       404:
 *         description: Loja ou usuário não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
export async function createCheckoutSessionController(
	request: AuthenticatedRequest,
	response: Response,
) {
	try {
		const { storeId, priceId, successUrl, cancelUrl } =
			createCheckoutSessionBodySchema.parse(request.body);

		console.log("Creating checkout session:", { storeId, priceId, successUrl, cancelUrl });

		const createCheckoutSessionUseCase = makeCreateCheckoutSessionUseCase();

		const { checkoutUrl } = await createCheckoutSessionUseCase.execute({
			storeId,
			priceId,
			successUrl,
			cancelUrl,
		});

		console.log("Checkout session created successfully:", { checkoutUrl });

		return response.status(200).json({
			checkoutUrl,
		});
	} catch (error) {
		console.error("Error creating checkout session:", error);

		if (error instanceof ZodError) {
			return response.status(400).json({
				message: "Validation error",
				issues: error.issues,
			});
		}

		if (error instanceof StoreNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		if (error instanceof UserNotFoundError) {
			return response.status(404).json({
				message: error.message,
			});
		}

		// Retornar mensagem de erro mais detalhada para depuração
		let errorMessage = error instanceof Error ? error.message : "Internal server error";
		const errorStack = error instanceof Error ? error.stack : undefined;

		// Detectar erros específicos do Stripe e melhorar mensagens
		if (error instanceof Error) {
			if (error.message.includes("No such price")) {
				// Mensagem já foi melhorada no StripeService
				errorMessage = error.message;
			} else if (error.message.includes("resource_missing")) {
				errorMessage = "Recurso do Stripe não encontrado. Verifique se os IDs de preços estão corretos nas variáveis de ambiente.";
			}
		}

		console.error("Unexpected error creating checkout session:", {
			message: errorMessage,
			stack: errorStack,
		});

		return response.status(500).json({
			message: errorMessage || "Internal server error",
		});
	}
}

