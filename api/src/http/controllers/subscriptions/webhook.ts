import type { Request, Response } from "express";
import { makeHandleStripeWebhookUseCase } from "~/use-cases/@factories/subscriptions/make-handle-stripe-webhook-use-case";
import { StripeService } from "~/services/payment/stripe-service";

const stripeService = new StripeService();

/**
 * @swagger
 * /subscriptions/webhook:
 *   post:
 *     summary: Webhook do Stripe para processar eventos de assinatura
 *     tags: [Subscriptions]
 *     description: Endpoint público que recebe eventos do Stripe via webhook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processado com sucesso
 *       400:
 *         description: Erro ao processar webhook
 */
export async function webhookController(
	request: Request,
	response: Response,
) {
	try {
		const signature = request.headers["stripe-signature"] as string;

		if (!signature) {
			return response.status(400).json({
				message: "Missing stripe-signature header",
			});
		}

		// O body deve ser raw (Buffer) para validação do Stripe
		// O middleware express.raw() já foi aplicado no index.ts para esta rota
		const payload = request.body as Buffer;

		// Verificar assinatura e construir evento
		const event = stripeService.constructWebhookEvent(
			payload,
			signature,
		);

		// Processar evento via use case
		const handleStripeWebhookUseCase = makeHandleStripeWebhookUseCase();
		await handleStripeWebhookUseCase.execute({ event });

		// Retornar 200 para Stripe
		return response.status(200).json({ received: true });
	} catch (error) {
		console.error("Error processing webhook:", error);

		return response.status(400).json({
			message: "Webhook processing failed",
		});
	}
}

