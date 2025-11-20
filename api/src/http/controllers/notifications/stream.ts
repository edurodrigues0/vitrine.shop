import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "~/http/middleware/authenticate";
import { sseService } from "~/services/sse-service";
import { getAuthCookie } from "~/utils/cookies";
import { verifyToken } from "~/utils/jwt";

/**
 * Endpoint SSE para receber notificações em tempo real
 * 
 * Nota: EventSource não suporta headers customizados, então aceitamos token via query param
 * como fallback quando cookies não funcionam
 */
export async function streamNotificationsController(
	request: Request,
	response: Response,
) {
	try {
		// Tentar obter token do cookie primeiro, depois do query param
		const token = getAuthCookie(request) || (request.query.token as string | undefined);

		if (!token) {
			response.writeHead(401, {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				"Connection": "keep-alive",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Credentials": "true",
			});
			response.write(`data: ${JSON.stringify({ type: "error", message: "Unauthorized" })}\n\n`);
			response.end();
			return;
		}

		// Verificar token
		let payload;
		try {
			payload = verifyToken(token);
		} catch (error) {
			console.error("SSE: Token verification failed:", error);
			response.writeHead(401, {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				"Connection": "keep-alive",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Credentials": "true",
			});
			response.write(`data: ${JSON.stringify({ type: "error", message: "Invalid or expired token" })}\n\n`);
			response.end();
			return;
		}

		const userId = payload.sub;
		// Adicionar cliente ao serviço SSE
		sseService.addClient(userId, response);

		// Manter conexão aberta
		// A conexão será fechada quando o cliente desconectar
		request.on("close", () => {
			// Cliente desconectado, será removido automaticamente pelo sseService
		});
	} catch (error) {
		console.error("SSE: Unexpected error:", error);
		// Erro de autenticação
		response.writeHead(500, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			"Connection": "keep-alive",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Credentials": "true",
		});
		response.write(`data: ${JSON.stringify({ type: "error", message: "Internal server error" })}\n\n`);
		response.end();
	}
}

