import type { Request, Response } from "express";
import { clearAuthCookie } from "~/utils/cookies";

export async function logoutController(_request: Request, response: Response) {
	try {
		// Remove o cookie de autenticação
		clearAuthCookie(response);

		return response.status(200).json({
			message: "Logged out successfully",
		});
	} catch (_error) {
		return response.status(500).json({
			error: "Internal server error",
		});
	}
}
