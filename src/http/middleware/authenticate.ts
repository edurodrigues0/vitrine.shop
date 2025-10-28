import type { NextFunction, Request, Response } from "express";
import { getAuthCookie } from "~/utils/cookies";
import { verifyToken } from "~/utils/jwt";

export interface AuthenticatedRequest extends Request {
	user?: {
		id: string;
		email: string;
		name: string;
	};
}

export async function authenticateMiddleware(
	request: AuthenticatedRequest,
	response: Response,
	next: NextFunction,
) {
	try {
		const token = getAuthCookie(request);

		if (!token) {
			return response.status(401).json({
				error: "Token de acesso não fornecido",
			});
		}

		const payload = verifyToken(token);

		// Adiciona as informações do usuário ao request
		request.user = {
			id: payload.sub,
			email: payload.email,
			name: payload.name,
		};

		next();
	} catch (error) {
		return response.status(401).json({
			error: "Token inválido ou expirado",
		});
	}
}
