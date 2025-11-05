import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "~/database/schema";
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
		// Prioridade: cookie primeiro, depois Bearer token
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
	} catch {
		return response.status(401).json({
			message: "Invalid or expired token",
		});
	}
}
