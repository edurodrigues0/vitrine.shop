import type { NextFunction, Request, Response } from "express";
import type { IncomingHttpHeaders } from "http";
import type { UserRole } from "~/database/schema";
import { auth } from "~/services/auth";
import { fromNodeHeaders } from "better-auth/node";
import { getAuthCookie } from "~/utils/cookies";
import { verifyToken } from "~/utils/jwt";

export interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		email: string;
		name: string;
		role: UserRole;
	};
}

/**
 * Extrai o token Bearer do header Authorization
 */
function getBearerToken(request: Request): string | undefined {
	const authHeader = request.headers.authorization;
	if (authHeader?.startsWith("Bearer ")) {
		return authHeader.substring(7);
	}
	return undefined;
}

export async function authenticateMiddleware(
	request: AuthenticatedRequest,
	response: Response,
	next: NextFunction,
) {
	try {
		// Prioridade 1: Verificar sessão do Better Auth (usa cookies)
		try {
			const session = await auth.api.getSession({
				headers: fromNodeHeaders(request.headers as IncomingHttpHeaders),
			});

			if (session && session.user) {
				request.user = {
					id: session.user.id,
					email: session.user.email,
					name: session.user.name || "",
					role: ((session.user as { role?: string }).role || "EMPLOYEE") as UserRole,
				};
				return next();
			}
		} catch (error) {
			// Se falhar ao verificar sessão do Better Auth, tentar token JWT como fallback
			console.debug("Better Auth session check failed, trying JWT token:", error);
		}

		// Prioridade 2: Fallback para token JWT (compatibilidade com sistema antigo)
		const token = getAuthCookie(request) || getBearerToken(request);

		if (!token) {
			return response.status(401).json({
				message: "Unauthorized",
			});
		}

		const payload = verifyToken(token);

		request.user = {
			id: payload.sub,
			email: payload.email,
			name: payload.name,
			role: payload.role,
		};

		next();
	} catch (error) {
		console.error("Authentication error:", error);
		return response.status(401).json({
			message: "Invalid or expired token",
		});
	}
}
