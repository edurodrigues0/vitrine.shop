import type { Request, Response } from "express";
import type { IncomingHttpHeaders } from "http";
import { auth } from "~/services/auth";
import { fromNodeHeaders } from "better-auth/node";
import { sseService } from "~/services/sse-service";
import { getAuthCookie } from "~/utils/cookies";
import { verifyToken } from "~/utils/jwt";

/**
 * Endpoint SSE para receber notificações em tempo real
 * 
 * Nota: EventSource não suporta headers customizados, então aceitamos token via query param
 * como fallback quando cookies não funcionam. Mas priorizamos a sessão do Better Auth via cookies.
 */
export async function streamNotificationsController(
	request: Request,
	response: Response,
) {
	try {
		let userId: string | undefined;

		// Prioridade 1: Verificar sessão do Better Auth (usa cookies)
		try {
			const session = await auth.api.getSession({
				headers: fromNodeHeaders(request.headers as IncomingHttpHeaders),
			});

			if (session && session.user) {
				userId = session.user.id;
			}
		} catch (error) {
			// Se falhar ao verificar sessão do Better Auth, tentar token JWT como fallback
			console.debug("SSE: Better Auth session check failed, trying JWT token:", error);
		}

		// Prioridade 2: Fallback para token JWT (compatibilidade com sistema antigo)
		if (!userId) {
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

			try {
				const payload = verifyToken(token);
				userId = payload.sub;
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
		}

		if (!userId) {
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

